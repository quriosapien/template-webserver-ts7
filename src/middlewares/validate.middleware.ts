import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodType } from 'zod';
import { AppError } from '@/utils/app-error.util';

export interface ValidateSchemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

/**
 * Validates `req.body`/`req.params`/`req.query` against Zod schemas, replacing
 * each with its parsed (and coerced) value. On failure, forwards an
 * `AppError.badRequest` carrying the Zod issues so the response still renders
 * through the app's single `errorHandler` convention.
 *
 * `req.query` needs special handling: in Express 5 it's defined via a getter
 * with no setter, so `req.query = parsed` throws. Since the property is
 * `configurable: true`, it's redefined instead.
 */
export function validate(schemas: ValidateSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }
      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        Object.defineProperty(req, 'query', {
          value: parsedQuery,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(AppError.badRequest('Request validation failed', err.issues));
        return;
      }
      next(err);
    }
  };
}
