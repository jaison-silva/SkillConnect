import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

import { UserRole } from '../constants/enums.js';



export class RegisterDTO {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsEnum(UserRole, {
    message: 'Role must be one of: CLIENT, PROVIDER, ADMIN',
  })
  role!: UserRole;
}

export class LoginDTO {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}

export class VerifyOtpDTO {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be a 6-digit code' })
  otp!: string;
}

export class ResendOtpDTO {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;
}

export class ForgotPasswordDTO {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;
}

export class ResetPasswordDTO {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be a 6-digit code' })
  otp!: string;

  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword!: string;
}