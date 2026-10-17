import {
  IsBooleanString,
  IsEnum,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '../constants/enums.js';

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
  @IsIn(['createdAt', 'name', 'email', 'strikeCount'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}