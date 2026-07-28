import { describe, expect, it } from 'vitest';
import type { DataStoreClient } from '@/db/types';
import { HealthRepository } from '@/repositories/health.repository';

const makeClient = (name: string): DataStoreClient => ({
  name,
  connect: async () => {},
  disconnect: async () => {},
});

describe('HealthRepository', () => {
  it('honestly reports "unknown" for every client instead of fabricating "healthy"', async () => {
    const repo = new HealthRepository([makeClient('postgres'), makeClient('redis')]);

    const checks = await repo.getDependencyStatuses();

    expect(checks).toEqual([
      {
        name: 'postgres',
        status: 'unknown',
        message: 'Connectivity check not implemented for this stub client.',
      },
      {
        name: 'redis',
        status: 'unknown',
        message: 'Connectivity check not implemented for this stub client.',
      },
    ]);
  });

  it('returns an empty array when there are no clients', async () => {
    const repo = new HealthRepository([]);

    await expect(repo.getDependencyStatuses()).resolves.toEqual([]);
  });

  it('preserves the input client order', async () => {
    const repo = new HealthRepository([makeClient('c'), makeClient('a'), makeClient('b')]);

    const checks = await repo.getDependencyStatuses();

    expect(checks.map((check) => check.name)).toEqual(['c', 'a', 'b']);
  });
});
