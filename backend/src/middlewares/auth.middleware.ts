import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { HttpStatus, UserRole } from '../constants/enums.js';
import { RESPONSE_MESSAGES } from '../constants/messages.js';
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
      new AppError(
        RESPONSE_MESSAGES.AUTH.AUTH_REQUIRED,
        HttpStatus.UNAUTHORIZED
      )
    );
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(
      new AppError(
        RESPONSE_MESSAGES.AUTH.ACCESS_TOKEN_MISSING,
        HttpStatus.UNAUTHORIZED
      )
    );
  }

  const accessSecret = process.env.JWT_ACCESS_SECRET || 'access_secret';

  try {
    const decoded = jwt.verify(token, accessSecret) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch {
    next(
      new AppError(
        RESPONSE_MESSAGES.AUTH.ACCESS_TOKEN_INVALID,
        HttpStatus.UNAUTHORIZED
      )
    );
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new AppError(
          RESPONSE_MESSAGES.AUTH.USER_NOT_AUTHENTICATED,
          HttpStatus.UNAUTHORIZED
        )
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          RESPONSE_MESSAGES.AUTH.ACCESS_DENIED(allowedRoles),
          HttpStatus.FORBIDDEN
        )
      );
    }

    next();
  };
};
