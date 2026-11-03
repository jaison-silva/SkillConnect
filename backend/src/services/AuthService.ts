import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { inject, injectable } from 'inversify';
import { HttpStatus, UserRole } from '../constants/enums.js';
import { RESPONSE_MESSAGES } from '../constants/messages.js';
import { TYPES } from '../constants/types.js';
import type { IUserRepository } from '../interface/IUserRepository.js';
import type { IEmailService } from '../interface/IEmailService.js';

import type {
    AuthTokensResponse,
    IAuthService,
} from '../interface/IAuthService.js';

import {
    ForgotPasswordDTO,
    GoogleAuthDTO,
    LoginDTO,
    RegisterDTO,
    ResendOtpDTO,
    ResetPasswordDTO,
    VerifyOtpDTO,
} from '../dtos/auth.dto.js';

import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

@injectable()
export class AuthService implements IAuthService {
    private readonly _googleClient = new OAuth2Client();

    constructor(
        @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
        @inject(TYPES.EmailService) private readonly _emailService: IEmailService
    ) { }

    private async _generateOtpPayload(ttlMinutes = 5) {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        const codeHash = await bcrypt.hash(otpCode, salt);
        const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
        return { otpCode, codeHash, expiresAt };
    }

    async register(data: RegisterDTO) {
        const existing = await this._userRepo.findByEmail(data.email);
        if (existing) {
            throw new AppError(
                RESPONSE_MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED,
                HttpStatus.CONFLICT
            );
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);
        const { otpCode, codeHash, expiresAt } = await this._generateOtpPayload(5);
 
        const user = await this._userRepo.create({
            name: data.name,
            email: data.email,
            passwordHash,
            role: data.role,
            isVerified: false,
            otp: { codeHash, expiresAt },
        });

        logger.info(`Registered new ${user.role}: ${user.email}`);

        await this._emailService.sendOtpEmail(user.email, otpCode, 'verification');

        return {
            userId: String(user._id),
            email: user.email,
            role: user.role,
            debugOtp: otpCode, 
        };
    }

    async login(data: LoginDTO): Promise<AuthTokensResponse> {
        const user = await this._userRepo.findByEmail(data.email);
        if (!user) {
            throw new AppError(
                RESPONSE_MESSAGES.AUTH.INVALID_CREDENTIALS,
                HttpStatus.UNAUTHORIZED
            );
        }

        if (user.isBlocked) {
            throw new AppError(
                RESPONSE_MESSAGES.AUTH.ACCOUNT_SUSPENDED,
                HttpStatus.FORBIDDEN
            );
        }

        if (!user.passwordHash) {
            throw new AppError(
                RESPONSE_MESSAGES.AUTH.PASSWORD_LOGIN_UNAVAILABLE,
                HttpStatus.BAD_REQUEST
            );
        }

        const isMatch = await bcrypt.compare(data.password, user.passwordHash);
        if (!isMatch) {
            throw new AppError(
                RESPONSE_MESSAGES.AUTH.INVALID_CREDENTIALS,
                HttpStatus.UNAUTHORIZED
            );
        }

        if (!user.isVerified) {
            throw new AppError(
                RESPONSE_MESSAGES.AUTH.EMAIL_NOT_VERIFIED,
                HttpStatus.FORBIDDEN
            );
        }

        const accessSecret = process.env.JWT_ACCESS_SECRET || 'access_secret';
        const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

        const payload = { id: String(user._id), role: user.role };
        const accessToken = jwt.sign(payload, accessSecret, { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' });

        return {
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
            },
            accessToken,
            refreshToken,
        };
    }

    async verifyOtp(data: VerifyOtpDTO) {
        const user = await this._userRepo.findByEmail(data.email);
        if (!user || !user.otp?.codeHash || !user.otp?.expiresAt) {
            throw new AppError(
                RESPONSE_MESSAGES.AUTH.OTP_REQUIRED,
                HttpStatus.BAD_REQUEST
            );
        }

        if (user.otp.expiresAt < new Date()) {
            throw new AppError(
                RESPONSE_MESSAGES.AUTH.OTP_EXPIRED,
                HttpStatus.BAD_REQUEST
            );
        }

        const isValid = await bcrypt.compare(data.otp, user.otp.codeHash);
        console.log(`OTP verification for ${data.email}: ${isValid ? 'valid' : 'invalid'}`);
        if (!isValid) {
            throw new AppError(
                RESPONSE_MESSAGES.AUTH.OTP_INVALID,
                HttpStatus.BAD_REQUEST
            );
        }

        await this._userRepo.updateById(String(user._id), {
            isVerified: true,
            $unset: { otp: 1 },
        });

        return { message: RESPONSE_MESSAGES.AUTH.OTP_VERIFIED_SUCCESS };
    }

    async resendOtp(data: ResendOtpDTO) {
        const user = await this._userRepo.findByEmail(data.email);
        if (!user) {
            throw new AppError(
                RESPONSE_MESSAGES.USER.NOT_FOUND,
                HttpStatus.NOT_FOUND
            );
        }

        const { otpCode, codeHash, expiresAt } = await this._generateOtpPayload(5);

        await this._userRepo.updateById(String(user._id), {
            otp: { codeHash, expiresAt },
        });

        await this._emailService.sendOtpEmail(user.email, otpCode, 'verification');

        return {
            message: RESPONSE_MESSAGES.AUTH.OTP_RESENT_SUCCESS,
            debugOtp: otpCode,
        };
    }

    async forgotPassword(data: ForgotPasswordDTO) {
        const user = await this._userRepo.findByEmail(data.email);
        if (!user) {
            return {
                message: RESPONSE_MESSAGES.AUTH.PASSWORD_RESET_IF_REGISTERED,
            };
        }

        const { otpCode, codeHash, expiresAt } = await this._generateOtpPayload(10);

        await this._userRepo.updateById(String(user._id), {
            otp: { codeHash, expiresAt },
        });

        await this._emailService.sendOtpEmail(user.email, otpCode, 'password-reset');

        return {
            message: RESPONSE_MESSAGES.AUTH.PASSWORD_RESET_OTP_SENT,
            debugOtp: otpCode,
        };
    }

    async resetPassword(data: ResetPasswordDTO) {
        const user = await this._userRepo.findByEmail(data.email);
        if (!user || !user.otp?.codeHash || !user.otp?.expiresAt) {
            throw new AppError(
                RESPONSE_MESSAGES.AUTH.RESET_OTP_INVALID_OR_EXPIRED,
                HttpStatus.BAD_REQUEST
            );
        }

        if (user.otp.expiresAt < new Date()) {
            throw new AppError(
                RESPONSE_MESSAGES.AUTH.RESET_OTP_EXPIRED,
                HttpStatus.BAD_REQUEST
            );
        }

        const isValid = await bcrypt.compare(data.otp, user.otp.codeHash);
        if (!isValid) {
            throw new AppError(
                RESPONSE_MESSAGES.AUTH.RESET_OTP_INVALID,
                HttpStatus.BAD_REQUEST
            );
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.newPassword, salt);

        await this._userRepo.updateById(String(user._id), {
            passwordHash,
            isVerified: true,
            $unset: { otp: 1 },
        });

        return { message: RESPONSE_MESSAGES.AUTH.PASSWORD_RESET_SUCCESS };
    }

    async refreshAccessToken(refreshToken: string) {
        if (!refreshToken) {
            throw new AppError(
                RESPONSE_MESSAGES.AUTH.REFRESH_TOKEN_MISSING,
                HttpStatus.UNAUTHORIZED
            );
        }

        const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
        const accessSecret = process.env.JWT_ACCESS_SECRET || 'access_secret';

        try {
            const decoded = jwt.verify(refreshToken, refreshSecret) as {
                id: string;
                role: string;
            };

            const user = await this._userRepo.findById(decoded.id);
            if (!user || user.isBlocked) {
                throw new AppError(
                    RESPONSE_MESSAGES.AUTH.USER_NOT_ACTIVE_OR_BLOCKED,
                    HttpStatus.FORBIDDEN
                );
            }

            const accessToken = jwt.sign(
                { id: String(user._id), role: user.role },
                accessSecret,
                { expiresIn: '15m' }
            );

            return { accessToken };
        } catch {
            throw new AppError(
                RESPONSE_MESSAGES.AUTH.REFRESH_TOKEN_INVALID,
                HttpStatus.UNAUTHORIZED
            );
        }
    }

    async googleAuth(data: GoogleAuthDTO): Promise<AuthTokensResponse> {
        const googleClientId = process.env.GOOGLE_CLIENT_ID;
        let payload;

        try {
            const ticket = await this._googleClient.verifyIdToken({
                idToken: data.credential,
                audience: googleClientId || undefined,
            });
            payload = ticket.getPayload();
        } catch (error) {
            logger.error(
                `Google token verification failed: ${error instanceof Error ? error.message : String(error)}`
            );
            throw new AppError(
                RESPONSE_MESSAGES.AUTH.GOOGLE_TOKEN_INVALID,
                HttpStatus.UNAUTHORIZED
            );
        }

        if (!payload || !payload.email) {
            throw new AppError(
                RESPONSE_MESSAGES.AUTH.GOOGLE_TOKEN_INVALID,
                HttpStatus.UNAUTHORIZED
            );
        }

        const email = payload.email.toLowerCase();
        const googleId = payload.sub;
        const name = payload.name || payload.given_name || email.split('@')[0];

        let user = await this._userRepo.findByGoogleId(googleId);
        if (!user) {
            user = await this._userRepo.findByEmail(email);
            if (user) {
                await this._userRepo.updateById(String(user._id), {
                    googleId,
                    isVerified: true,
                });
                user.googleId = googleId;
                user.isVerified = true;
            }
        }

        if (user) {
            if (user.isBlocked) {
                throw new AppError(
                    RESPONSE_MESSAGES.AUTH.ACCOUNT_SUSPENDED,
                    HttpStatus.FORBIDDEN
                );
            }
        } else {
            user = await this._userRepo.create({
                name,
                email,
                role: data.role || UserRole.CLIENT,
                googleId,
                isVerified: true,
            });
            logger.info(`Registered new user via Google: ${user.email} (${user.role})`);
        }

        const accessSecret = process.env.JWT_ACCESS_SECRET || 'access_secret';
        const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

        const tokenPayload = { id: String(user._id), role: user.role };
        const accessToken = jwt.sign(tokenPayload, accessSecret, { expiresIn: '15m' });
        const refreshToken = jwt.sign(tokenPayload, refreshSecret, { expiresIn: '7d' });

        return {
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
            },
            accessToken,
            refreshToken,
        };
    }
}
