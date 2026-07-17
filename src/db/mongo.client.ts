import type { Document, MongoClient, OptionalId, WithId } from 'mongodb';
import type { Logger } from 'pino';
import type { DataStoreClient } from '@/db/types';

/**
 * MongoDB client — STUB. Exposes idiomatic find/insert/update/delete helpers.
 * Real connection wiring is intentionally deferred.
 */
export class MongoDbClient implements DataStoreClient {
  readonly name = 'mongodb';
  private client: MongoClient | null = null;

  constructor(
    private readonly url: string,
    private readonly dbName: string,
    private readonly logger: Logger,
  ) {}

  get isConnected(): boolean {
    return this.client !== null;
  }

  async connect(): Promise<void> {
    // TODO: this.client = new MongoClient(this.url); await this.client.connect();
    this.logger.info(
      { store: this.name, target: new URL(this.url).host, db: this.dbName },
      'connect() stub',
    );
  }

  async disconnect(): Promise<void> {
    // TODO: await this.client?.close();
    this.client = null;
    this.logger.info({ store: this.name }, 'disconnect() stub');
  }

  async find<T extends Document>(collection: string, filter: Document = {}): Promise<WithId<T>[]> {
    // TODO: return this.client!.db(this.dbName).collection<T>(collection).find(filter).toArray();
    this.logger.debug({ store: this.name, collection, filter }, 'find() stub');
    return [];
  }

  async insert<T extends Document>(collection: string, doc: OptionalId<T>): Promise<string> {
    // TODO: const r = await this.client!.db(this.dbName).collection<T>(collection).insertOne(doc); return r.insertedId.toString();
    this.logger.debug({ store: this.name, collection, doc }, 'insert() stub');
    return 'stub-id';
  }

  async update(collection: string, id: string, patch: Document): Promise<boolean> {
    // TODO: const r = await this.client!.db(this.dbName).collection(collection).updateOne({ _id: new ObjectId(id) }, { $set: patch }); return r.modifiedCount > 0;
    this.logger.debug({ store: this.name, collection, id, patch }, 'update() stub');
    return false;
  }

  async delete(collection: string, id: string): Promise<boolean> {
    // TODO: const r = await this.client!.db(this.dbName).collection(collection).deleteOne({ _id: new ObjectId(id) }); return r.deletedCount > 0;
    this.logger.debug({ store: this.name, collection, id }, 'delete() stub');
    return false;
  }
}
