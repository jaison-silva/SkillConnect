import {
  IsBooleanString,
  IsEnum,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { KycStatus, UserRole } from '../constants/enums.js';

export class CrmQueryDTO {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBooleanString()
  isVerified?: string;

  @IsOptional()
  @IsBooleanString()
  isBlocked?: string;

  @IsOptional()
  @IsEnum(KycStatus)
  kycStatus?: KycStatus;

  @IsOptional()
  @IsIn(['createdAt', 'name', 'email', 'strikeCount'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class UpdateKycDTO {
  @IsEnum(KycStatus, {
    message: 'kycStatus must be PENDING, APPROVED, or REJECTED',
  })
  kycStatus!: KycStatus;
}