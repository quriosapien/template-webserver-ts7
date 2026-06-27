import { HttpStatus } from '@/constants';
import { failure } from '@/helpers/response.helper';
import { AppError } from '@/utils/app-error.util';
import type { NextFunction, Request, Response } from 'express';

/**
 * Central error handler. Express 5 forwards rejected async handlers here
 * automatically, so controllers can simply `throw`.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // `next` is required for Express to recognise this as an error handler.
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      req.log.error({ err }, 'Non-operational error');
    } else {
      req.log.warn({ err: err.message, statusCode: err.statusCode }, 'Handled error');
    }
    res.status(err.statusCode).json(failure(err.message, err.details));
    return;
  }

  req.log.error({ err }, 'Unhandled error');
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(failure('Internal server error'));
}
