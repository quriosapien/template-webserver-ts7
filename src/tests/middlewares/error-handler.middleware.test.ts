import { describe, expect, it } from 'vitest';
import { HttpStatus } from '@/constants';
import { errorHandler } from '@/middlewares/error-handler.middleware';
import { createMockRequest, createMockResponse } from '@/tests/support/express-mocks';
import { createFakeLogger } from '@/tests/support/fake-logger';
import { AppError } from '@/utils/app-error.util';

describe('errorHandler', () => {
  it('responds with the AppError status code and logs via warn for operational errors', () => {
    const logger = createFakeLogger();
    const req = createMockRequest({ log: logger });
    const res = createMockResponse();

    errorHandler(AppError.badRequest('invalid email'), req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'invalid email' },
    });
    expect(logger.warn).toHaveBeenCalledOnce();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('logs via error instead of warn for non-operational AppErrors', () => {
    const logger = createFakeLogger();
    const req = createMockRequest({ log: logger });
    const res = createMockResponse();
    const err = new AppError('db crashed', HttpStatus.INTERNAL_SERVER_ERROR, {
      isOperational: false,
    });

    errorHandler(err, req, res, () => {});

    expect(logger.error).toHaveBeenCalledOnce();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('includes details in the response when the AppError carries them', () => {
    const req = createMockRequest({ log: createFakeLogger() });
    const res = createMockResponse();

    errorHandler(AppError.badRequest('invalid', { field: 'email' }), req, res, () => {});

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'invalid', details: { field: 'email' } },
    });
  });

  it('omits details in the response when the AppError has none', () => {
    const req = createMockRequest({ log: createFakeLogger() });
    const res = createMockResponse();

    errorHandler(AppError.notFound(), req, res, () => {});

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Resource not found' },
    });
  });

  it('responds 500 with a generic message and logs via error for unknown thrown values', () => {
    const logger = createFakeLogger();
    const req = createMockRequest({ log: logger });
    const res = createMockResponse();

    errorHandler(new Error('boom'), req, res, () => {});

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Internal server error' },
    });
    expect(logger.error).toHaveBeenCalledOnce();
  });

  it('calls res.status().json() exactly once per invocation', () => {
    const req = createMockRequest({ log: createFakeLogger() });
    const res = createMockResponse();

    errorHandler(new Error('boom'), req, res, () => {});

    expect(res.status).toHaveBeenCalledOnce();
    expect(res.json).toHaveBeenCalledOnce();
  });
});
