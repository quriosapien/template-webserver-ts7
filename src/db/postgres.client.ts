import type { DataStoreClient } from '@/db/types';
import type { Pool, QueryResultRow } from 'pg';
import type { Logger } from 'pino';

/**
 * PostgreSQL client — STUB. Holds the pool handle and exposes the idiomatic
 * `query` method. Real connection wiring is intentionally deferred.
 */
export class PostgresClient implements DataStoreClient {
  readonly name = 'postgres';
  private pool: Pool | null = null;

  constructor(
    private readonly url: string,
    private readonly logger: Logger,
  ) {}

  get isConnected(): boolean {
    return this.pool !== null;
  }

  async connect(): Promise<void> {
    // TODO: this.pool = new Pool({ connectionString: this.url }); await this.pool.query('SELECT 1');
    this.logger.info({ store: this.name, target: new URL(this.url).host }, 'connect() stub');
  }

  async disconnect(): Promise<void> {
    // TODO: await this.pool?.end();
    this.pool = null;
    this.logger.info({ store: this.name }, 'disconnect() stub');
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    // TODO: return (await this.pool!.query<T>(sql, params)).rows;
    this.logger.debug({ store: this.name, sql, params }, 'query() stub');
    return [];
  }
}
