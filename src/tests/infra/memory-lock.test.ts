import { describe, expect, it } from 'vitest';
import { MemoryLock } from '@/infra/memory-lock';
import { LockAcquireTimeoutError } from '@/infra/types';

describe('MemoryLock', () => {
  it('tryAcquire grants a free lock and rejects a second holder', () => {
    const locks = new MemoryLock();

    const first = locks.tryAcquire('order');
    expect(first).not.toBeNull();
    expect(locks.isLocked('order')).toBe(true);
    expect(locks.tryAcquire('order')).toBeNull();

    first?.release();
    expect(locks.isLocked('order')).toBe(false);
  });

  it('release by lockId frees the lock; double-release is a no-op', () => {
    const locks = new MemoryLock();
    const lease = locks.tryAcquire('x');
    expect(lease).not.toBeNull();

    expect(locks.release(lease!.lockId)).toBe(true);
    expect(locks.release(lease!.lockId)).toBe(false);
    expect(locks.isLocked('x')).toBe(false);

    lease!.release(); // idempotent via the lease closure
  });

  it('release with a mismatched expectedName fails', () => {
    const locks = new MemoryLock();
    const lease = locks.tryAcquire('alpha');
    expect(locks.release(lease!.lockId, 'beta')).toBe(false);
    expect(locks.isLocked('alpha')).toBe(true);
    expect(locks.release(lease!.lockId, 'alpha')).toBe(true);
  });

  it('queues waiters FIFO and wakes the next on release', async () => {
    const locks = new MemoryLock();
    const first = await locks.acquire('q');

    let secondGranted = false;
    const secondPromise = locks.acquire('q').then((lease) => {
      secondGranted = true;
      return lease;
    });

    await Promise.resolve();
    expect(secondGranted).toBe(false);

    first.release();
    const second = await secondPromise;
    expect(secondGranted).toBe(true);
    expect(locks.isLocked('q')).toBe(true);
    second.release();
  });

  it('rejects acquire when timeout elapses while the lock is held', async () => {
    const locks = new MemoryLock();
    const held = await locks.acquire('busy');

    await expect(locks.acquire('busy', 20)).rejects.toBeInstanceOf(LockAcquireTimeoutError);

    held.release();
  });

  it('rejects immediately when timeoutMs is non-positive', async () => {
    const locks = new MemoryLock();
    await locks.acquire('busy');

    await expect(locks.acquire('busy', 0)).rejects.toBeInstanceOf(LockAcquireTimeoutError);
  });
});
