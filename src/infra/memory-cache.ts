import { DEFAULT_CACHE_TTL_MS } from '@/constants';
import type { Cache, CacheRead } from '@/infra/types';

interface CacheEntry {
  value: unknown;
  expiresAt: number;
  ttlMs: number;
}

/**
 * In-process cache backed by a Map. Expired entries are removed lazily on
 * read/has/size sweeps — fine for small demos and low-traffic apps.
 */
export class MemoryCache implements Cache {
  private readonly store = new Map<string, CacheEntry>();

  constructor(private readonly defaultTtlMs: number = DEFAULT_CACHE_TTL_MS) {
    if (defaultTtlMs <= 0) {
      throw new Error('defaultTtlMs must be a positive number');
    }
  }

  get<T>(key: string): T | undefined {
    return this.read<T>(key)?.value;
  }

  read<T>(key: string): CacheRead<T> | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return { value: entry.value as T, ttlMs: entry.ttlMs, expiresAt: entry.expiresAt };
  }

  set<T>(key: string, value: T, ttlMs: number = this.defaultTtlMs): void {
    if (ttlMs <= 0) {
      throw new Error('ttlMs must be a positive number');
    }
    this.store.set(key, { value, ttlMs, expiresAt: Date.now() + ttlMs });
  }

  del(key: string): boolean {
    return this.store.delete(key);
  }

  has(key: string): boolean {
    return this.read(key) !== undefined;
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    this.pruneExpired();
    return this.store.size;
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) {
        this.store.delete(key);
      }
    }
  }
}
