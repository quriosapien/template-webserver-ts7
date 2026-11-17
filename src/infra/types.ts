export interface CacheRead<T = unknown> {
  value: T;
  ttlMs: number;
  expiresAt: number;
}

/**
 * Process-local cache. Entries expire after a TTL (default 5 minutes).
 * Not shared across cluster workers or process restarts.
 */
export interface Cache {
  get<T>(key: string): T | undefined;
  /** Like `get`, plus the TTL that was set and absolute expiry. */
  read<T>(key: string): CacheRead<T> | undefined;
  set<T>(key: string, value: T, ttlMs?: number): void;
  del(key: string): boolean;
  has(key: string): boolean;
  clear(): void;
  readonly size: number;
}

/** Lease returned when a named lock is acquired. */
export interface LockLease {
  /** Opaque id used to release the lock over HTTP (or without holding `release`). */
  lockId: string;
  /** Call once to free the lock; subsequent calls are no-ops. */
  release: () => void;
}

/**
 * Process-local named mutex. Waiters queue FIFO; acquire may time out.
 * Not shared across cluster workers or process restarts.
 */
export interface Lock {
  acquire(name: string, timeoutMs?: number): Promise<LockLease>;
  tryAcquire(name: string): LockLease | null;
  /** Frees the lease. When `expectedName` is set, rejects mismatches. */
  release(lockId: string, expectedName?: string): boolean;
  isLocked(name: string): boolean;
}

/** Thrown when `Lock.acquire` exceeds its timeout while the name is held. */
export class LockAcquireTimeoutError extends Error {
  constructor(
    readonly lockName: string,
    timeoutMs: number,
  ) {
    super(`Timed out after ${timeoutMs}ms waiting for lock "${lockName}"`);
    this.name = new.target.name;
  }
}
