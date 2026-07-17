import type { DataStoreClient } from '@/db/types';
import type { DependencyCheck, IHealthRepository } from '@/types/health.types';

/**
 * Reports the health of each registered datastore. STUB: currently reports
 * every connected client as healthy. Replace with real pings later.
 */
export class HealthRepository implements IHealthRepository {
  constructor(private readonly clients: DataStoreClient[]) {}

  async getDependencyStatuses(): Promise<DependencyCheck[]> {
    // TODO: ping each client (e.g. SELECT 1, PING) and report real health.
    return this.clients.map((client) => ({ name: client.name, healthy: true }));
  }
}
