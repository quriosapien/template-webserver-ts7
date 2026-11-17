import { randomUUID } from 'node:crypto';
import { type Lock, LockAcquireTimeoutError, type LockLease } from '@/infra/types';

interface Waiter {
  resolve: (lease: LockLease) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout> | undefined;
}

/**
 * In-process named mutex with a FIFO waiter queue. Release by calling the
 * lease's `release()` or `release(lockId)`. Safe for single-process demos only.
 */
export class MemoryLock implements Lock {
  /** lock name → current holder's lockId */
  private readonly holders = new Map<string, string>();
  /** lockId → lock name */
  private readonly leases = new Map<string, string>();
  /** lock name → FIFO waiters */
  private readonly waiters = new Map<string, Waiter[]>();

  async acquire(name: string, timeoutMs?: number): Promise<LockLease> {
    const immediate = this.tryAcquire(name);
    if (immediate) return immediate;

    return new Promise<LockLease>((resolve, reject) => {
      const waiter: Waiter = { resolve, reject, timer: undefined };

      if (timeoutMs !== undefined) {
        if (timeoutMs <= 0) {
          reject(new LockAcquireTimeoutError(name, timeoutMs));
          return;
        }
        waiter.timer = setTimeout(() => {
          this.removeWaiter(name, waiter);
          reject(new LockAcquireTimeoutError(name, timeoutMs));
        }, timeoutMs);
        waiter.timer.unref?.();
      }

      const queue = this.waiters.get(name) ?? [];
      queue.push(waiter);
      this.waiters.set(name, queue);
    });
  }

  tryAcquire(name: string): LockLease | null {
    if (this.holders.has(name)) return null;
    return this.grant(name);
  }

  release(lockId: string, expectedName?: string): boolean {
    const name = this.leases.get(lockId);
    if (name === undefined) return false;
    if (expectedName !== undefined && name !== expectedName) return false;
    if (this.holders.get(name) !== lockId) return false;

    this.holders.delete(name);
    this.leases.delete(lockId);
    this.grantNext(name);
    return true;
  }

  isLocked(name: string): boolean {
    return this.holders.has(name);
  }

  private grant(name: string): LockLease {
    const lockId = randomUUID();
    this.holders.set(name, lockId);
    this.leases.set(lockId, name);

    let released = false;
    const release = (): void => {
      if (released) return;
      released = true;
      this.release(lockId);
    };

    return { lockId, release };
  }

  private grantNext(name: string): void {
    const queue = this.waiters.get(name);
    if (!queue || queue.length === 0) return;

    const next = queue.shift();
    if (queue.length === 0) {
      this.waiters.delete(name);
    }
    if (!next) return;

    if (next.timer) clearTimeout(next.timer);
    next.resolve(this.grant(name));
  }

  private removeWaiter(name: string, waiter: Waiter): void {
    const queue = this.waiters.get(name);
    if (!queue) return;
    const index = queue.indexOf(waiter);
    if (index === -1) return;
    queue.splice(index, 1);
    if (queue.length === 0) this.waiters.delete(name);
  }
}
