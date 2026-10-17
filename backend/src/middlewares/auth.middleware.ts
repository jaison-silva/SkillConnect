import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../constants/enums.js';
import { AppError } from '../utils/AppError.js';

export interface JwtUserPayload {
  id: string;
  role: UserRole;
}

declare global {

  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new AppError('Authentication required. Please provide a Bearer token.', 401)
    );
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new AppError('Access token is missing.', 401));
  }

  const accessSecret = process.env.JWT_ACCESS_SECRET || 'access_secret';

  try {
    const decoded = jwt.verify(token, accessSecret) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch {
    next(new AppError('Invalid or expired access token.', 401));
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('User is not authenticated.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`,
          403
        )
      );
    }

    next();
  };
};