import type { HealthStatus, IHealthRepository, IHealthService } from '@/types/health.types';

/**
 * Business logic for health reporting. Depends only on the repository
 * interface, so unit tests inject a mock repo (see health.service.test.ts).
 */
export class HealthService implements IHealthService {
  constructor(private readonly repository: IHealthRepository) {}

  async getHealth(): Promise<HealthStatus> {
    const checks = await this.repository.getDependencyStatuses();
    const hasUnhealthy = checks.some((check) => check.status === 'unhealthy');

    return {
      status: hasUnhealthy ? 'degraded' : 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
