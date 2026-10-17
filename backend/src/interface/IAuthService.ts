import {
  ForgotPasswordDTO,
  LoginDTO,
  RegisterDTO,
  ResendOtpDTO,
  ResetPasswordDTO,
  VerifyOtpDTO,
} from '../dtos/auth.dto.js';

export interface AuthTokensResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface IAuthService {
    
  register(data: RegisterDTO): Promise<{
    userId: string;
    email: string;
    role: string;
    debugOtp: string;
  }>;

  login(data: LoginDTO): Promise<AuthTokensResponse>;
  verifyOtp(data: VerifyOtpDTO): Promise<{ message: string }>;
  resendOtp(data: ResendOtpDTO): Promise<{ message: string; debugOtp: string }>;
  forgotPassword(
    data: ForgotPasswordDTO
  ): Promise<{ message: string; debugOtp?: string }>;
  resetPassword(data: ResetPasswordDTO): Promise<{ message: string }>;
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;
}