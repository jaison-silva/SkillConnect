export const UserRole = {
  CLIENT: 'CLIENT',
  PROVIDER: 'PROVIDER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
}

export interface CrmUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isBlocked: boolean;
  strikeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  role: string;
  debugOtp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
  debugOtp?: string;
}

export interface CrmQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  role?: UserRole | string;
  isVerified?: string;
  isBlocked?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CrmUsersResponse {
  users: CrmUser[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface ToggleBlockResponse {
  userId: string;
  isBlocked: boolean;
  message: string;
}
