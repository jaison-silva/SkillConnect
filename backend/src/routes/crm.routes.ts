import { Router } from 'express';
import { container } from '../config/container.js';
import { TYPES } from '../constants/types.js';
import { UserRole } from '../constants/enums.js';
import { AdminCrmController } from '../controllers/AdminCrmController.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validateDto } from '../middlewares/validate.middleware.js';
import { CrmQueryDTO, UpdateKycDTO } from '../dtos/crm.dto.js';

const router = Router();
const crmController = container.get<AdminCrmController>(
  TYPES.AdminCrmController
);


router.use(authenticate, authorize(UserRole.ADMIN));


router.get('/users', validateDto(CrmQueryDTO, 'query'), crmController.getUsers);


router.patch('/users/:id/block', crmController.toggleBlockUser);


router.patch(
  '/users/:id/kyc',
  validateDto(UpdateKycDTO, 'body'),
  crmController.updateProviderKyc
);

export default router;