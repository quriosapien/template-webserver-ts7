import { z } from 'zod';

/**
 * Demo feature for process-local cache + named locks.
 * Not a template for product features — copy `health`'s full layering instead.
 */

export const demoCacheKeyParamsSchema = z.object({
  key: z.string().min(1).max(256),
});

export const demoCacheSetBodySchema = z.object({
  value: z.unknown(),
  ttlMs: z
    .number()
    .int()
    .positive()
    .max(24 * 60 * 60 * 1000)
    .optional(),
});

export const demoLockNameParamsSchema = z.object({
  name: z.string().min(1).max(128),
});

export const demoLockAcquireBodySchema = z
  .object({
    timeoutMs: z.number().int().positive().max(60_000).optional(),
  })
  .default({});

export const demoLockReleaseBodySchema = z.object({
  lockId: z.string().uuid(),
});

export type DemoCacheKeyParams = z.infer<typeof demoCacheKeyParamsSchema>;
export type DemoCacheSetBody = z.infer<typeof demoCacheSetBodySchema>;
export type DemoLockNameParams = z.infer<typeof demoLockNameParamsSchema>;
export type DemoLockAcquireBody = z.infer<typeof demoLockAcquireBodySchema>;
export type DemoLockReleaseBody = z.infer<typeof demoLockReleaseBodySchema>;

export interface DemoCacheEntry {
  key: string;
  value: unknown;
  ttlMs: number;
}

export interface DemoLockStatus {
  name: string;
  locked: boolean;
}

export interface DemoLockHeld {
  name: string;
  lockId: string;
}

export interface IDemoService {
  getCache(key: string): DemoCacheEntry;
  setCache(key: string, value: unknown, ttlMs?: number): DemoCacheEntry;
  deleteCache(key: string): void;
  acquireLock(name: string, timeoutMs?: number): Promise<DemoLockHeld>;
  releaseLock(name: string, lockId: string): void;
  getLockStatus(name: string): DemoLockStatus;
}
