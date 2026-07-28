import { describe, expect, it } from 'vitest';
import { MongoDbClient } from '@/db/mongo.client';
import { createFakeLogger } from '@/tests/support/fake-logger';

describe('MongoDbClient', () => {
  it('reports its name', () => {
    const client = new MongoDbClient('mongodb://localhost:27017', 'test', createFakeLogger());

    expect(client.name).toBe('mongodb');
  });

  it('is not connected before connect(), and stays disconnected after (stub never sets the client)', async () => {
    const client = new MongoDbClient('mongodb://localhost:27017', 'test', createFakeLogger());

    expect(client.isConnected).toBe(false);
    await client.connect();
    expect(client.isConnected).toBe(false);
  });

  it('resolves connect() and disconnect() without throwing, including when never connected', async () => {
    const client = new MongoDbClient('mongodb://localhost:27017', 'test', createFakeLogger());

    await expect(client.connect()).resolves.toBeUndefined();
    await expect(client.disconnect()).resolves.toBeUndefined();
    await expect(client.disconnect()).resolves.toBeUndefined();
  });

  it('find() always resolves to an empty array', async () => {
    const client = new MongoDbClient('mongodb://localhost:27017', 'test', createFakeLogger());

    await expect(client.find('users')).resolves.toEqual([]);
    await expect(client.find('users', { active: true })).resolves.toEqual([]);
  });

  it('insert() always resolves to the stub id', async () => {
    const client = new MongoDbClient('mongodb://localhost:27017', 'test', createFakeLogger());

    await expect(client.insert('users', { name: 'ada' })).resolves.toBe('stub-id');
  });

  it('update() and delete() always resolve to false', async () => {
    const client = new MongoDbClient('mongodb://localhost:27017', 'test', createFakeLogger());

    await expect(client.update('users', '1', { name: 'ada' })).resolves.toBe(false);
    await expect(client.delete('users', '1')).resolves.toBe(false);
  });
});
