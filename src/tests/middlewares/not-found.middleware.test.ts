import { describe, expect, it } from 'vitest';
import { HttpStatus } from '@/constants';
import { notFound } from '@/middlewares/not-found.middleware';
import { createMockRequest, createMockResponse } from '@/tests/support/express-mocks';

describe('notFound', () => {
  it('responds 404 with the method and path interpolated into the message', () => {
    const req = createMockRequest({ method: 'GET', path: '/unknown' });
    const res = createMockResponse();

    notFound(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Route not found: GET /unknown' },
    });
  });

  it('interpolates a different method and path pair', () => {
    const req = createMockRequest({ method: 'POST', path: '/bar' });
    const res = createMockResponse();

    notFound(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Route not found: POST /bar' },
    });
  });
});
