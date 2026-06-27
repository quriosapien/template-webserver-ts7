import type {
  HealthStatus,
  IHealthRepository,
  IHealthService,
} from '@/modules/health/health.types';

/**
 * Business logic for health reporting. Depends only on the repository
 * interface, so unit tests inject a mock repo (see health.service.test.ts).
 */
export class HealthService implements IHealthService {
  constructor(private readonly repository: IHealthRepository) {}

  async getHealth(): Promise<HealthStatus> {
    const checks = await this.repository.getDependencyStatuses();
    const allHealthy = checks.every((check) => check.healthy);

    return {
      status: allHealthy ? 'ok' : 'degraded',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
