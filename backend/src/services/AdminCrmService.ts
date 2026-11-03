import { inject, injectable } from 'inversify';
import { TYPES } from '../constants/types.js';
import { HttpStatus, UserRole } from '../constants/enums.js';
import { RESPONSE_MESSAGES } from '../constants/messages.js';

import type {
  CrmFilterOptions,
  IUserRepository,
} from '../interface/IUserRepository.js';

import type {
  CrmUsersResponse,
  IAdminCrmService,
} from '../interface/IAdminCrmService.js';

import { CrmQueryDTO } from '../dtos/crm.dto.js';
import { AppError } from '../utils/AppError.js';

@injectable()
export class AdminCrmService implements IAdminCrmService {
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository
  ) {}

  async getUsers(query: CrmQueryDTO): Promise<CrmUsersResponse> {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    const filters: CrmFilterOptions = {};

    if (query.search) filters.search = query.search.trim();
    if (query.role) filters.role = query.role;
    if (query.isVerified !== undefined) {
      filters.isVerified = query.isVerified === 'true';
    }
    if (query.isBlocked !== undefined) {
      filters.isBlocked = query.isBlocked === 'true';
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const { users, total } = await this._userRepo.findPaginatedUsers(
      filters,
      skip,
      limit,
      sortBy,
      sortOrder
    );

    return {
      users,
      totalUsers: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit) || 1,
      limit,
    };
  }

  async toggleBlockUser(userId: string) {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new AppError(
        RESPONSE_MESSAGES.USER.NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    if (user.role === UserRole.ADMIN) {
      throw new AppError(
        RESPONSE_MESSAGES.USER.CANNOT_BLOCK_ADMIN,
        HttpStatus.FORBIDDEN
      );
    }

    const updated = await this._userRepo.updateById(userId, {
      isBlocked: !user.isBlocked,
    });

    const isBlocked = Boolean(updated?.isBlocked);
    return {
      userId: String(updated?._id),
      isBlocked,
      message: RESPONSE_MESSAGES.USER.USER_STATUS_UPDATED(isBlocked),
    };
  }
}
