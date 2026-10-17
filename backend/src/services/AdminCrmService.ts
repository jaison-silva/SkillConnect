import { inject, injectable } from 'inversify';
import { TYPES } from '../constants/types.js';
import { KycStatus, UserRole } from '../constants/enums.js';

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
    @inject(TYPES.UserRepository) private readonly userRepo: IUserRepository
  ) {}

  async getUsers(query: CrmQueryDTO): Promise<CrmUsersResponse> {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    const filters: CrmFilterOptions = {};

    if (query.search) filters.search = query.search.trim();
    if (query.role) filters.role = query.role;
    if (query.kycStatus) filters.kycStatus = query.kycStatus;
    if (query.isVerified !== undefined) {
      filters.isVerified = query.isVerified === 'true';
    }
    if (query.isBlocked !== undefined) {
      filters.isBlocked = query.isBlocked === 'true';
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const { users, total } = await this.userRepo.findPaginatedUsers(
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
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    if (user.role === UserRole.ADMIN) {
      throw new AppError('Cannot block an ADMIN account.', 403);
    }

    const updated = await this.userRepo.updateById(userId, {
      isBlocked: !user.isBlocked,
    });

    const statusText = updated?.isBlocked ? 'blocked' : 'unblocked';
    return {
      userId: String(updated?._id),
      isBlocked: Boolean(updated?.isBlocked),
      message: `User has been ${statusText} successfully.`,
    };
  }

  async updateProviderKyc(userId: string, kycStatus: KycStatus) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    if (user.role !== UserRole.PROVIDER) {
      throw new AppError('KYC status only applies to PROVIDER accounts.', 400);
    }

    const updated = await this.userRepo.updateById(userId, {
      'providerProfile.kycStatus': kycStatus,
    });

    return {
      userId: String(updated?._id),
      kycStatus: updated?.providerProfile?.kycStatus || kycStatus,
      message: `Provider KYC status updated to ${kycStatus}.`,
    };
  }
}