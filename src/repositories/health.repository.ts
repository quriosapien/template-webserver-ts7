import type { DataStoreClient } from '@/db/types';
import type { DependencyCheck, IHealthRepository } from '@/types/health.types';

/**
 * Reports the health of each registered datastore. STUB: connectivity pings
 * aren't implemented yet, so every client honestly reports 'unknown' rather
 * than a fabricated 'healthy'. Replace with real pings (SELECT 1, PING, etc.)
 * later.
 */
export class HealthRepository implements IHealthRepository {
  constructor(private readonly clients: DataStoreClient[]) {}

  async getDependencyStatuses(): Promise<DependencyCheck[]> {
    return this.clients.map((client) => ({
      name: client.name,
      status: 'unknown',
      message: 'Connectivity check not implemented for this stub client.',
    }));
  }
}
