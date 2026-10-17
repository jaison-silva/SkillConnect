import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { inject, injectable } from 'inversify';
import { TYPES } from '../constants/types.js';
import type { IUserRepository } from '../interface/IUserRepository.js';

import type {
    AuthTokensResponse,
    IAuthService,
} from '../interface/IAuthService.js';

import {
    ForgotPasswordDTO,
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
    constructor(
        @inject(TYPES.UserRepository) private readonly userRepo: IUserRepository
    ) { }

    private async generateOtpPayload(ttlMinutes = 5) {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        const codeHash = await bcrypt.hash(otpCode, salt);
        const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
        return { otpCode, codeHash, expiresAt };
    }

    async register(data: RegisterDTO) {
        const existing = await this.userRepo.findByEmail(data.email);
        if (existing) {
            throw new AppError('Email is already registered.', 409);
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);
        const { otpCode, codeHash, expiresAt } = await this.generateOtpPayload(5);
 
        const user = await this.userRepo.create({
            name: data.name,
            email: data.email,
            passwordHash,
            role: data.role,
            isVerified: false,
            otp: { codeHash, expiresAt },
        });

        logger.info(`Registered new ${user.role}: ${user.email}`);

        return {
            userId: String(user._id),
            email: user.email,
            role: user.role,
            debugOtp: otpCode, 
        };
    }

    async login(data: LoginDTO): Promise<AuthTokensResponse> {
        const user = await this.userRepo.findByEmail(data.email);
        if (!user) {
            throw new AppError('Invalid email or password.', 401);
        }

        if (user.isBlocked) {
            throw new AppError(
                'Your account has been suspended by an administrator.',
                403
            );
        }

        const isMatch = await bcrypt.compare(data.password, user.passwordHash);
        if (!isMatch) {
            throw new AppError('Invalid email or password.', 401);
        }

        if (!user.isVerified) {
            throw new AppError(
                'Please verify your email via OTP before logging in.',
                403
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
        const user = await this.userRepo.findByEmail(data.email);
        if (!user || !user.otp?.codeHash || !user.otp?.expiresAt) {
            throw new AppError('No active OTP request found for this email.', 400);
        }

        if (user.otp.expiresAt < new Date()) {
            throw new AppError('OTP has expired. Please request a new one.', 400);
        }

        const isValid = await bcrypt.compare(data.otp, user.otp.codeHash);
        console.log(`OTP verification for ${data.email}: ${isValid ? 'valid' : 'invalid'}`);
        if (!isValid) {
            throw new AppError('Invalid OTP code.', 400);
        }

        await this.userRepo.updateById(String(user._id), {
            isVerified: true,
            $unset: { otp: 1 },
        });

        return { message: 'Account verified successfully.' };
    }

    async resendOtp(data: ResendOtpDTO) {
        const user = await this.userRepo.findByEmail(data.email);
        if (!user) {
            throw new AppError('User not found.', 404);
        }

        const { otpCode, codeHash, expiresAt } = await this.generateOtpPayload(5);

        await this.userRepo.updateById(String(user._id), {
            otp: { codeHash, expiresAt },
        });

        return {
            message: 'A new 6-digit OTP has been sent.',
            debugOtp: otpCode,
        };
    }

    async forgotPassword(data: ForgotPasswordDTO) {
        const user = await this.userRepo.findByEmail(data.email);
        if (!user) {
            return {
                message: 'If that email is registered, a reset OTP has been sent.',
            };
        }

        const { otpCode, codeHash, expiresAt } = await this.generateOtpPayload(10);

        await this.userRepo.updateById(String(user._id), {
            otp: { codeHash, expiresAt },
        });

        return {
            message: 'Password reset OTP sent (valid for 10 minutes).',
            debugOtp: otpCode,
        };
    }

    async resetPassword(data: ResetPasswordDTO) {
        const user = await this.userRepo.findByEmail(data.email);
        if (!user || !user.otp?.codeHash || !user.otp?.expiresAt) {
            throw new AppError('Invalid or expired password reset request.', 400);
        }

        if (user.otp.expiresAt < new Date()) {
            throw new AppError('Reset OTP has expired.', 400);
        }

        const isValid = await bcrypt.compare(data.otp, user.otp.codeHash);
        if (!isValid) {
            throw new AppError('Invalid reset OTP code.', 400);
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.newPassword, salt);

        await this.userRepo.updateById(String(user._id), {
            passwordHash,
            isVerified: true,
            $unset: { otp: 1 },
        });

        return { message: 'Password has been reset successfully.' };
    }

    async refreshAccessToken(refreshToken: string) {
        if (!refreshToken) {
            throw new AppError('Refresh token is missing.', 401);
        }

        const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
        const accessSecret = process.env.JWT_ACCESS_SECRET || 'access_secret';

        try {
            const decoded = jwt.verify(refreshToken, refreshSecret) as {
                id: string;
                role: string;
            };

            const user = await this.userRepo.findById(decoded.id);
            if (!user || user.isBlocked) {
                throw new AppError('User no longer active or blocked.', 403);
            }

            const accessToken = jwt.sign(
                { id: String(user._id), role: user.role },
                accessSecret,
                { expiresIn: '15m' }
            );

            return { accessToken };
        } catch {
            throw new AppError('Invalid or expired refresh token.', 401);
        }
    }
}