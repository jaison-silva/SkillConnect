export const TYPES = {
  // Repositories
  UserRepository: Symbol.for('UserRepository'),

  // Services
  AuthService: Symbol.for('AuthService'),
  AdminCrmService: Symbol.for('AdminCrmService'),
  EmailService: Symbol.for('EmailService'),

  // Controllers
  AuthController: Symbol.for('AuthController'),
  AdminCrmController: Symbol.for('AdminCrmController'),
};