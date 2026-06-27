/** Health of a single downstream dependency (datastore, etc.). */
export interface DependencyCheck {
  name: string;
  healthy: boolean;
}

/** Aggregate health payload returned by GET /api/health. */
export interface HealthStatus {
  status: 'ok' | 'degraded';
  uptimeSeconds: number;
  timestamp: string;
  checks: DependencyCheck[];
}

/** Repository contract — lets the service be tested against a mock. */
export interface IHealthRepository {
  getDependencyStatuses(): Promise<DependencyCheck[]>;
}

/** Service contract — lets the controller be tested against a mock. */
export interface IHealthService {
  getHealth(): Promise<HealthStatus>;
}
