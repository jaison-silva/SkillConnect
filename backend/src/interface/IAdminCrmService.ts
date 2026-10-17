import { CrmQueryDTO } from '../dtos/crm.dto.js';
import { IUser } from '../models/User.js';

export interface CrmUsersResponse {
  users: IUser[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface IAdminCrmService {
  getUsers(query: CrmQueryDTO): Promise<CrmUsersResponse>;
  toggleBlockUser(userId: string): Promise<{
    userId: string;
    isBlocked: boolean;
    message: string;
  }>;
}