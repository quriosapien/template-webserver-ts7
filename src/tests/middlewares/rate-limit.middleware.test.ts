import { describe, expect, it, vi } from 'vitest';
import { HttpStatus } from '@/constants';
import { createRateLimiter, rateLimitExceededHandler } from '@/middlewares/rate-limit.middleware';
import { createMockRequest, createMockResponse } from '@/tests/support/express-mocks';
import { createFakeLogger } from '@/tests/support/fake-logger';

describe('rateLimitExceededHandler', () => {
  it('responds 429 with the standard failure envelope', () => {
    const req = createMockRequest({ log: createFakeLogger() });
    const res = createMockResponse();

    // biome-ignore lint/suspicious/noExplicitAny: optionsUsed isn't relevant to this handler
    rateLimitExceededHandler(req, res, vi.fn(), {} as any);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.TOO_MANY_REQUESTS);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Too many requests, please try again later.' },
    });
  });

  it('logs the rate-limit event via req.log.warn', () => {
    const logger = createFakeLogger();
    const req = createMockRequest({ log: logger });
    const res = createMockResponse();

    // biome-ignore lint/suspicious/noExplicitAny: optionsUsed isn't relevant to this handler
    rateLimitExceededHandler(req, res, vi.fn(), {} as any);

    expect(logger.warn).toHaveBeenCalledOnce();
  });
});

describe('createRateLimiter', () => {
  it('returns an Express middleware function configured from windowMs/max', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });

    expect(limiter).toBeTypeOf('function');
  });
});
