import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CACHE_TTL_MS } from '@/constants';
import { MemoryCache } from '@/infra/memory-cache';

describe('MemoryCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects a non-positive default TTL', () => {
    expect(() => new MemoryCache(0)).toThrow(/positive/);
  });

  it('stores and returns values with the default 5-minute TTL', () => {
    const cache = new MemoryCache();
    cache.set('a', { n: 1 });

    expect(cache.get('a')).toEqual({ n: 1 });
    expect(cache.read('a')?.ttlMs).toBe(DEFAULT_CACHE_TTL_MS);
    expect(cache.has('a')).toBe(true);
    expect(cache.size).toBe(1);
  });

  it('expires entries after the configured TTL', () => {
    const cache = new MemoryCache();
    cache.set('a', 'value', 1_000);

    vi.advanceTimersByTime(999);
    expect(cache.get('a')).toBe('value');

    vi.advanceTimersByTime(1);
    expect(cache.get('a')).toBeUndefined();
    expect(cache.has('a')).toBe(false);
  });

  it('rejects a non-positive per-entry TTL', () => {
    const cache = new MemoryCache();
    expect(() => cache.set('a', 1, 0)).toThrow(/positive/);
  });

  it('deletes keys and clears the store', () => {
    const cache = new MemoryCache();
    cache.set('a', 1);
    cache.set('b', 2);

    expect(cache.del('a')).toBe(true);
    expect(cache.del('missing')).toBe(false);
    expect(cache.size).toBe(1);

    cache.clear();
    expect(cache.size).toBe(0);
  });

  it('prunes expired entries when reading size', () => {
    const cache = new MemoryCache();
    cache.set('a', 1, 100);
    vi.advanceTimersByTime(100);
    expect(cache.size).toBe(0);
  });
});
