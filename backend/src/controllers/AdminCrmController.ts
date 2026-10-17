import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../constants/types.js';
import type { IAdminCrmService } from '../interface/IAdminCrmService.js';
import { CrmQueryDTO } from '../dtos/crm.dto.js';

@injectable()
export class AdminCrmController {
  constructor(
    @inject(TYPES.AdminCrmService)
    private readonly crmService: IAdminCrmService
  ) {}

  getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.crmService.getUsers(
        req.query as unknown as CrmQueryDTO
      );
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };

  toggleBlockUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = String(req.params.id);
      const result = await this.crmService.toggleBlockUser(userId);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  };
}