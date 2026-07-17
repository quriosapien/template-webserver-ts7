import { describe, expect, it, vi } from 'vitest';
import { HealthService } from '@/services/health.service';
import type { DependencyCheck, IHealthRepository } from '@/types/health.types';

/**
 * Demonstrates isolated unit testing: the service is exercised against a fully
 * mocked repository — no real datastore, no other layer involved.
 */
describe('HealthService', () => {
  const makeRepo = (checks: DependencyCheck[]): IHealthRepository => ({
    getDependencyStatuses: vi.fn().mockResolvedValue(checks),
  });

  it('reports "ok" when every dependency is healthy', async () => {
    const repo = makeRepo([
      { name: 'postgres', healthy: true },
      { name: 'redis', healthy: true },
    ]);
    const service = new HealthService(repo);

    const health = await service.getHealth();

    expect(health.status).toBe('ok');
    expect(health.checks).toHaveLength(2);
    expect(repo.getDependencyStatuses).toHaveBeenCalledOnce();
  });

  it('reports "degraded" when any dependency is unhealthy', async () => {
    const repo = makeRepo([
      { name: 'postgres', healthy: true },
      { name: 'kafka', healthy: false },
    ]);
    const service = new HealthService(repo);

    const health = await service.getHealth();

    expect(health.status).toBe('degraded');
  });

  it('includes uptime and an ISO timestamp', async () => {
    const service = new HealthService(makeRepo([]));

    const health = await service.getHealth();

    expect(health.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(() => new Date(health.timestamp).toISOString()).not.toThrow();
  });
});
