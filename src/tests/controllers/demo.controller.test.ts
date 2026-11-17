import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_CACHE_TTL_MS, HttpStatus } from '@/constants';
import { DemoController } from '@/controllers/demo.controller';
import { createMockRequest, createMockResponse } from '@/tests/support/express-mocks';
import type { IDemoService } from '@/types/demo.types';

describe('DemoController', () => {
  const makeService = (overrides: Partial<IDemoService> = {}): IDemoService => ({
    getCache: vi.fn(),
    setCache: vi.fn(),
    deleteCache: vi.fn(),
    acquireLock: vi.fn(),
    releaseLock: vi.fn(),
    getLockStatus: vi.fn(),
    ...overrides,
  });

  it('setCache uses the default TTL when the body omits ttlMs', () => {
    const service = makeService({
      setCache: vi.fn().mockReturnValue({ key: 'k', value: 1, ttlMs: DEFAULT_CACHE_TTL_MS }),
    });
    const controller = new DemoController(service);
    const res = createMockResponse();

    controller.setCache(createMockRequest({ params: { key: 'k' }, body: { value: 1 } }), res);

    expect(service.setCache).toHaveBeenCalledWith('k', 1, DEFAULT_CACHE_TTL_MS);
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
  });

  it('getCache returns 200 with the entry', () => {
    const service = makeService({
      getCache: vi.fn().mockReturnValue({ key: 'k', value: 'v', ttlMs: 1000 }),
    });
    const controller = new DemoController(service);
    const res = createMockResponse();

    controller.getCache(createMockRequest({ params: { key: 'k' } }), res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { key: 'k', value: 'v', ttlMs: 1000 },
    });
  });

  it('deleteCache responds 204', () => {
    const service = makeService({ deleteCache: vi.fn() });
    const controller = new DemoController(service);
    const res = createMockResponse();

    controller.deleteCache(createMockRequest({ params: { key: 'k' } }), res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
    expect(res.send).toHaveBeenCalled();
  });

  it('acquireLock and releaseLock round-trip through the service', async () => {
    const service = makeService({
      acquireLock: vi.fn().mockResolvedValue({ name: 'n', lockId: 'id' }),
      releaseLock: vi.fn(),
    });
    const controller = new DemoController(service);

    const acquireRes = createMockResponse();
    await controller.acquireLock(
      createMockRequest({ params: { name: 'n' }, body: { timeoutMs: 100 } }),
      acquireRes,
    );
    expect(service.acquireLock).toHaveBeenCalledWith('n', 100);
    expect(acquireRes.status).toHaveBeenCalledWith(HttpStatus.OK);

    const releaseRes = createMockResponse();
    controller.releaseLock(
      createMockRequest({ params: { name: 'n' }, body: { lockId: 'id' } }),
      releaseRes,
    );
    expect(service.releaseLock).toHaveBeenCalledWith('n', 'id');
    expect(releaseRes.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
  });

  it('getLockStatus returns the lock flag', () => {
    const service = makeService({
      getLockStatus: vi.fn().mockReturnValue({ name: 'n', locked: false }),
    });
    const controller = new DemoController(service);
    const res = createMockResponse();

    controller.getLockStatus(createMockRequest({ params: { name: 'n' } }), res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { name: 'n', locked: false },
    });
  });
});
