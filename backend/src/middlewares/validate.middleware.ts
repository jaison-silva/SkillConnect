import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

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

      res.status(400).json({
        status: 'error',
        message: errorMessages[0] || 'Validation failed',
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