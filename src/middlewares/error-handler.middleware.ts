import type { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '@/constants';
import { failure } from '@/helpers/response.helper';
import { AppError } from '@/utils/app-error.util';

/**
 * The shape Express's own middleware (e.g. body-parser) throws for
 * client-caused errors: a numeric statusCode plus `expose: true` marking the
 * message as safe to return, per the `http-errors` convention. Not an
 * `AppError` instance, but operational in the same sense.
 */
interface ExposedHttpError {
  statusCode: number;
  expose: true;
  message: string;
}

function isExposedHttpError(err: unknown): err is ExposedHttpError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'expose' in err &&
    (err as { expose: unknown }).expose === true &&
    'statusCode' in err &&
    typeof (err as { statusCode: unknown }).statusCode === 'number'
  );
}

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

  if (isExposedHttpError(err)) {
    req.log.warn({ err: err.message, statusCode: err.statusCode }, 'Handled error');
    res.status(err.statusCode).json(failure(err.message));
    return;
  }

  req.log.error({ err }, 'Unhandled error');
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(failure('Internal server error'));
}
