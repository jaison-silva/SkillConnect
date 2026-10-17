import { UpdateQuery } from 'mongoose';
import { IUser } from '../models/User.js';
import { UserRole } from '../constants/enums.js';

export interface PaginatedUsersResult {
  users: IUser[];
  total: number;
}

export interface CrmFilterOptions {
  search?: string;
  role?: UserRole;
  isVerified?: boolean;
  isBlocked?: boolean;
}

export interface IUserRepository {
  create(data: Partial<IUser>): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  updateById(id: string, update: UpdateQuery<IUser>): Promise<IUser | null>;
  deleteById(id: string): Promise<IUser | null>;
  findPaginatedUsers(
    filters: CrmFilterOptions,
    skip: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): Promise<PaginatedUsersResult>;
}