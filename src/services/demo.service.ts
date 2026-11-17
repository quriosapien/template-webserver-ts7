import { DEFAULT_CACHE_TTL_MS, HttpStatus } from '@/constants';
import { type Cache, type Lock, LockAcquireTimeoutError } from '@/infra/types';
import type {
  DemoCacheEntry,
  DemoLockHeld,
  DemoLockStatus,
  IDemoService,
} from '@/types/demo.types';
import { AppError } from '@/utils/app-error.util';

/**
 * Thin orchestration over process-local cache and locks for the `/api/demo`
 * surface. Maps infra errors onto `AppError` for the HTTP layer.
 */
export class DemoService implements IDemoService {
  constructor(
    private readonly cache: Cache,
    private readonly locks: Lock,
    private readonly defaultTtlMs: number = DEFAULT_CACHE_TTL_MS,
  ) {}

  getCache(key: string): DemoCacheEntry {
    const entry = this.cache.read(key);
    if (!entry) {
      throw AppError.notFound(`Cache key "${key}" not found`);
    }
    return { key, value: entry.value, ttlMs: entry.ttlMs };
  }

  setCache(key: string, value: unknown, ttlMs: number = this.defaultTtlMs): DemoCacheEntry {
    this.cache.set(key, value, ttlMs);
    return { key, value, ttlMs };
  }

  deleteCache(key: string): void {
    if (!this.cache.del(key)) {
      throw AppError.notFound(`Cache key "${key}" not found`);
    }
  }

  async acquireLock(name: string, timeoutMs?: number): Promise<DemoLockHeld> {
    try {
      const lease = await this.locks.acquire(name, timeoutMs);
      return { name, lockId: lease.lockId };
    } catch (err) {
      if (err instanceof LockAcquireTimeoutError) {
        throw new AppError(err.message, HttpStatus.CONFLICT);
      }
      throw err;
    }
  }

  releaseLock(name: string, lockId: string): void {
    if (!this.locks.release(lockId, name)) {
      throw AppError.notFound(`Lock "${name}" with id "${lockId}" not found or already released`);
    }
  }

  getLockStatus(name: string): DemoLockStatus {
    return { name, locked: this.locks.isLocked(name) };
  }
}
