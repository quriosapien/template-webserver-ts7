import type { Redis } from 'ioredis';
import type { Logger } from 'pino';
import type { DataStoreClient } from '@/db/types';

/**
 * Redis client — STUB. Exposes idiomatic get/set/del helpers. Real connection
 * wiring is intentionally deferred.
 */
export class RedisClient implements DataStoreClient {
  readonly name = 'redis';
  private client: Redis | null = null;

  constructor(
    private readonly url: string,
    private readonly logger: Logger,
  ) {}

  get isConnected(): boolean {
    return this.client !== null;
  }

  async connect(): Promise<void> {
    // TODO: this.client = new IORedis(this.url); await this.client.ping();
    this.logger.info({ store: this.name, target: new URL(this.url).host }, 'connect() stub');
  }

  async disconnect(): Promise<void> {
    // TODO: await this.client?.quit();
    this.client = null;
    this.logger.info({ store: this.name }, 'disconnect() stub');
  }

  async get(key: string): Promise<string | null> {
    // TODO: return this.client!.get(key);
    this.logger.debug({ store: this.name, key }, 'get() stub');
    return null;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    // TODO: ttlSeconds ? this.client!.set(key, value, 'EX', ttlSeconds) : this.client!.set(key, value);
    this.logger.debug({ store: this.name, key, value, ttlSeconds }, 'set() stub');
  }

  async del(key: string): Promise<boolean> {
    // TODO: return (await this.client!.del(key)) > 0;
    this.logger.debug({ store: this.name, key }, 'del() stub');
    return false;
  }
}
