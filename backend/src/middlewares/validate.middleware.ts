import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../constants/enums.js';
import { RESPONSE_MESSAGES } from '../constants/messages.js';

export const validateDto = <T extends object>(
  DtoClass: ClassConstructor<T>,
  source: 'body' | 'query' = 'body'
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const dtoInstance = plainToInstance(DtoClass, req[source]);
    const errors = await validate(dtoInstance, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });

    if (errors.length > 0) {
      const errorMessages = errors
        .map((err) => Object.values(err.constraints || {}))
        .flat();

      res.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: errorMessages[0] || RESPONSE_MESSAGES.SYSTEM.VALIDATION_FAILED,
        errors: errorMessages,
      });
      return;
    }

    if (source === 'body') {
      req.body = dtoInstance;
    }

    next();
  };
};
