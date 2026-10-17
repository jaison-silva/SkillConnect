import { Container } from 'inversify';
import { TYPES } from '../constants/types.js';
import { IUserRepository } from '../interface/IUserRepository.js';
import { IAuthService } from '../interface/IAuthService.js';
import { IAdminCrmService } from '../interface/IAdminCrmService.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { AuthService } from '../services/AuthService.js';
import { AdminCrmService } from '../services/AdminCrmService.js';
import { AuthController } from '../controllers/AuthController.js';
import { AdminCrmController } from '../controllers/AdminCrmController.js';

const container = new Container();


container
  .bind<IUserRepository>(TYPES.UserRepository)
  .to(UserRepository)
  .inSingletonScope();


container
  .bind<IAuthService>(TYPES.AuthService)
  .to(AuthService)
  .inSingletonScope();
container
  .bind<IAdminCrmService>(TYPES.AdminCrmService)
  .to(AdminCrmService)
  .inSingletonScope();


container
  .bind<AuthController>(TYPES.AuthController)
  .to(AuthController)
  .inSingletonScope();
container
  .bind<AdminCrmController>(TYPES.AdminCrmController)
  .to(AdminCrmController)
  .inSingletonScope();

export { container };