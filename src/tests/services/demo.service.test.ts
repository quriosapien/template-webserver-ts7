import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_CACHE_TTL_MS, HttpStatus } from '@/constants';
import { type Cache, type Lock, LockAcquireTimeoutError } from '@/infra/types';
import { DemoService } from '@/services/demo.service';
import { AppError } from '@/utils/app-error.util';

describe('DemoService', () => {
  const makeCache = (overrides: Partial<Cache> = {}): Cache => ({
    get: vi.fn(),
    read: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    has: vi.fn(),
    clear: vi.fn(),
    size: 0,
    ...overrides,
  });

  const makeLocks = (overrides: Partial<Lock> = {}): Lock => ({
    acquire: vi.fn(),
    tryAcquire: vi.fn(),
    release: vi.fn(),
    isLocked: vi.fn(),
    ...overrides,
  });

  it('setCache writes through with the default TTL when omitted', () => {
    const cache = makeCache();
    const service = new DemoService(cache, makeLocks());

    const result = service.setCache('k', { ok: true });

    expect(cache.set).toHaveBeenCalledWith('k', { ok: true }, DEFAULT_CACHE_TTL_MS);
    expect(result).toEqual({ key: 'k', value: { ok: true }, ttlMs: DEFAULT_CACHE_TTL_MS });
  });

  it('getCache returns the stored entry or throws notFound', () => {
    const cache = makeCache({
      read: vi.fn().mockReturnValue({ value: 1, ttlMs: 1000, expiresAt: Date.now() + 1000 }),
    });
    const service = new DemoService(cache, makeLocks());

    expect(service.getCache('k')).toEqual({ key: 'k', value: 1, ttlMs: 1000 });

    cache.read = vi.fn().mockReturnValue(undefined);
    expect(() => service.getCache('missing')).toThrow(AppError);
  });

  it('deleteCache throws when the key is absent', () => {
    const cache = makeCache({ del: vi.fn().mockReturnValue(false) });
    const service = new DemoService(cache, makeLocks());

    expect(() => service.deleteCache('missing')).toThrow(AppError);
  });

  it('acquireLock maps timeout errors to HTTP 409', async () => {
    const locks = makeLocks({
      acquire: vi.fn().mockRejectedValue(new LockAcquireTimeoutError('x', 50)),
    });
    const service = new DemoService(makeCache(), locks);

    await expect(service.acquireLock('x', 50)).rejects.toMatchObject({
      statusCode: HttpStatus.CONFLICT,
    });
  });

  it('releaseLock throws when the lease is unknown', () => {
    const locks = makeLocks({ release: vi.fn().mockReturnValue(false) });
    const service = new DemoService(makeCache(), locks);

    expect(() => service.releaseLock('n', '00000000-0000-4000-8000-000000000000')).toThrow(
      AppError,
    );
  });

  it('getLockStatus reports whether the name is held', () => {
    const locks = makeLocks({ isLocked: vi.fn().mockReturnValue(true) });
    const service = new DemoService(makeCache(), locks);

    expect(service.getLockStatus('n')).toEqual({ name: 'n', locked: true });
  });
});
