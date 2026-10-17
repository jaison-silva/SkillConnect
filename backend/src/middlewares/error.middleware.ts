 import { NextFunction, Request, Response } from 'express';
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

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};