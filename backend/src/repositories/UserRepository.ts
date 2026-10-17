import { injectable } from 'inversify';
import { QueryFilter } from 'mongoose';
import User, { IUser } from '../models/User.js';
import { BaseRepository } from './BaseRepository.js';
import {
  CrmFilterOptions,
  IUserRepository,
  PaginatedUsersResult,
} from '../interface/IUserRepository.js';

@injectable()
export class UserRepository
  extends BaseRepository<IUser>
  implements IUserRepository
{
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.findOne({ email: email.toLowerCase() });
  }
 
  async findPaginatedUsers(
    filters: CrmFilterOptions,
    skip: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): Promise<PaginatedUsersResult> {

    
    const query: QueryFilter<IUser> = {};

    if (filters.role) {
      query.role = filters.role;
    }

    if (typeof filters.isVerified === 'boolean') {
      query.isVerified = filters.isVerified;
    }

    if (typeof filters.isBlocked === 'boolean') {
      query.isBlocked = filters.isBlocked;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const sortOptions: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [users, total] = await Promise.all([
      this.model
        .find(query)
        .select('-passwordHash -otp')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);

    return { users, total };
  }
}