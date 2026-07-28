import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { validate } from '@/middlewares/validate.middleware';
import { createMockRequest, createMockResponse } from '@/tests/support/express-mocks';
import { AppError } from '@/utils/app-error.util';

describe('validate', () => {
  it('parses and replaces req.body against the given schema, then calls next()', () => {
    const schema = z.object({ message: z.string() });
    const req = createMockRequest({ body: { message: 'hi', extra: 'dropped' } });
    const res = createMockResponse();
    const next = vi.fn();

    validate({ body: schema })(req, res, next);

    expect(req.body).toEqual({ message: 'hi' });
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next(AppError) with the Zod issues when req.body fails validation', () => {
    const schema = z.object({ message: z.string() });
    const req = createMockRequest({ body: { message: 42 } });
    const res = createMockResponse();
    const next = vi.fn();

    validate({ body: schema })(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0]?.[0];
    expect(err).toBeInstanceOf(AppError);
    expect((err as AppError).statusCode).toBe(400);
    expect((err as AppError).details).toBeDefined();
  });

  it('parses and replaces req.params against the given schema', () => {
    const schema = z.object({ id: z.uuid() });
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const req = createMockRequest({ params: { id } });
    const res = createMockResponse();
    const next = vi.fn();

    validate({ params: schema })(req, res, next);

    expect(req.params).toEqual({ id });
    expect(next).toHaveBeenCalledWith();
  });

  it('parses req.query even though Express 5 exposes it as a getter-only property', () => {
    const schema = z.object({ page: z.coerce.number() });
    const req = createMockRequest();
    // Express 5 defines `query` via a getter with no setter (configurable: true).
    // Reproduce that shape so this test fails if validate() ever naively does `req.query = ...`.
    Object.defineProperty(req, 'query', {
      get: () => ({ page: '2' }),
      configurable: true,
      enumerable: true,
    });
    const res = createMockResponse();
    const next = vi.fn();

    expect(() => validate({ query: schema })(req, res, next)).not.toThrow();
    expect(req.query).toEqual({ page: 2 });
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next(AppError) when req.query fails validation', () => {
    const schema = z.object({ page: z.coerce.number() });
    const req = createMockRequest();
    Object.defineProperty(req, 'query', {
      get: () => ({ page: 'not-a-number' }),
      configurable: true,
      enumerable: true,
    });
    const res = createMockResponse();
    const next = vi.fn();

    validate({ query: schema })(req, res, next);

    const err = next.mock.calls[0]?.[0];
    expect(err).toBeInstanceOf(AppError);
  });

  it('calls next() with no args when no schemas are given', () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = vi.fn();

    validate({})(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
