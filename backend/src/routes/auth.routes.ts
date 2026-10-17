import { Router } from 'express';
import { container } from '../config/container.js';
import { TYPES } from '../constants/types.js';
import { AuthController } from '../controllers/AuthController.js';
import { validateDto } from '../middlewares/validate.middleware.js';
import {
    ForgotPasswordDTO,
    LoginDTO,
    RegisterDTO,
    ResendOtpDTO,
    ResetPasswordDTO,
    VerifyOtpDTO,
} from '../dtos/auth.dto.js';

const router = Router();
const authController = container.get<AuthController>(TYPES.AuthController);

router.post('/register', validateDto(RegisterDTO), authController.register);
router.post('/login', validateDto(LoginDTO), authController.login);
router.post('/verify-otp', validateDto(VerifyOtpDTO), authController.verifyOtp);
router.post('/resend-otp', validateDto(ResendOtpDTO), authController.resendOtp);

router.post(
    '/forgot-password',
    validateDto(ForgotPasswordDTO),
    authController.forgotPassword
);

router.post(
    '/reset-password',
    validateDto(ResetPasswordDTO),
    authController.resetPassword
);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

export default router;