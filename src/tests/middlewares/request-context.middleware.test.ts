import { describe, expect, it, vi } from 'vitest';
import { requestContext } from '@/middlewares/request-context.middleware';
import { createMockRequest, createMockResponse } from '@/tests/support/express-mocks';
import { createFakeLogger } from '@/tests/support/fake-logger';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('requestContext', () => {
  it('generates a request id and sets the response header when none is inbound', () => {
    const middleware = requestContext(createFakeLogger());
    const req = createMockRequest({ headers: {} });
    const res = createMockResponse();
    const next = vi.fn();

    middleware(req, res, next);

    expect(req.id).toMatch(UUID_PATTERN);
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', req.id);
    expect(next).toHaveBeenCalledOnce();
  });

  it('reuses an inbound x-request-id header instead of generating one', () => {
    const middleware = requestContext(createFakeLogger());
    const req = createMockRequest({ headers: { 'x-request-id': 'inbound-id' } });
    const res = createMockResponse();

    middleware(req, res, vi.fn());

    expect(req.id).toBe('inbound-id');
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', 'inbound-id');
  });

  it('attaches a child logger scoped to the request id, method, and url', () => {
    const baseLogger = createFakeLogger();
    const middleware = requestContext(baseLogger);
    const req = createMockRequest({
      method: 'GET',
      url: '/api/health',
      headers: { 'x-request-id': 'req-1' },
    });
    const res = createMockResponse();

    middleware(req, res, vi.fn());

    expect(baseLogger.child).toHaveBeenCalledWith({
      requestId: 'req-1',
      method: 'GET',
      url: '/api/health',
    });
    expect(req.log).toBeDefined();
  });
});
