import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../constants/enums.js';
import { RESPONSE_MESSAGES } from '../constants/messages.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.warn(`[${req.method}] ${req.originalUrl} -> ${err.message}`);
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  logger.error(
    `[${req.method}] ${req.originalUrl} -> Unexpected Error: ${err.stack || err.message}`
  );

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: RESPONSE_MESSAGES.SYSTEM.INTERNAL_SERVER_ERROR,
  });
};
