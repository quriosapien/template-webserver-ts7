import type { Client } from '@elastic/elasticsearch';
import type { Logger } from 'pino';
import type { DataStoreClient } from '@/db/types';

/**
 * Elasticsearch client — STUB. Exposes idiomatic index/search helpers. Real
 * connection wiring is intentionally deferred.
 */
export class ElasticsearchClient implements DataStoreClient {
  readonly name = 'elasticsearch';
  private client: Client | null = null;

  constructor(
    private readonly node: string,
    private readonly logger: Logger,
  ) {}

  get isConnected(): boolean {
    return this.client !== null;
  }

  async connect(): Promise<void> {
    // TODO: this.client = new Client({ node: this.node }); await this.client.ping();
    this.logger.info({ store: this.name, target: new URL(this.node).host }, 'connect() stub');
  }

  async disconnect(): Promise<void> {
    // TODO: await this.client?.close();
    this.client = null;
    this.logger.info({ store: this.name }, 'disconnect() stub');
  }

  async index(indexName: string, document: Record<string, unknown>, id?: string): Promise<string> {
    // TODO: const r = await this.client!.index({ index: indexName, id, document }); return r._id;
    this.logger.debug({ store: this.name, index: indexName, id, document }, 'index() stub');
    return id ?? 'stub-id';
  }

  async search<T>(indexName: string, query: Record<string, unknown>): Promise<T[]> {
    // TODO: const r = await this.client!.search<T>({ index: indexName, query }); return r.hits.hits.map(h => h._source!);
    this.logger.debug({ store: this.name, index: indexName, query }, 'search() stub');
    return [];
  }
}
