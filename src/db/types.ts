/**
 * Every datastore client implements this lifecycle so the composition root can
 * connect them all on boot and disconnect them all on shutdown uniformly.
 */
export interface DataStoreClient {
  readonly name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

/**
 * Generic CRUD-ish contract a feature repository may implement on top of a
 * datastore client. Real features will extend this with domain-specific methods.
 */
export interface Repository<T, Id = string> {
  read(id: Id): Promise<T | null>;
  write(entity: T): Promise<T>;
  update(id: Id, patch: Partial<T>): Promise<T | null>;
  delete(id: Id): Promise<boolean>;
}
