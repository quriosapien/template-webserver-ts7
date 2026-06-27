import { HttpStatus, type HttpStatusCode } from '@/constants';

/**
 * Operational error carrying an HTTP status. Thrown anywhere in the stack and
 * translated into a response by the central error-handler middleware.
 */
export class AppError extends Error {
  readonly statusCode: HttpStatusCode;
  readonly isOperational: boolean;
  readonly details?: unknown;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    options: { isOperational?: boolean; details?: unknown } = {},
  ) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.isOperational = options.isOperational ?? true;
    this.details = options.details;
    Error.captureStackTrace?.(this, new.target);
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(message, HttpStatus.NOT_FOUND);
  }

  static badRequest(message = 'Bad request', details?: unknown): AppError {
    return new AppError(message, HttpStatus.BAD_REQUEST, { details });
  }
}
