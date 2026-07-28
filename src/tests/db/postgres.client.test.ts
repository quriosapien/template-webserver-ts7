import { describe, expect, it } from 'vitest';
import { PostgresClient } from '@/db/postgres.client';
import { createFakeLogger } from '@/tests/support/fake-logger';

describe('PostgresClient', () => {
  it('reports its name', () => {
    const client = new PostgresClient('postgres://localhost:5432/test', createFakeLogger());

    expect(client.name).toBe('postgres');
  });

  it('is not connected before connect()', () => {
    const client = new PostgresClient('postgres://localhost:5432/test', createFakeLogger());

    expect(client.isConnected).toBe(false);
  });

  it('stays disconnected after connect() (stub never sets the pool)', async () => {
    const client = new PostgresClient('postgres://localhost:5432/test', createFakeLogger());

    await client.connect();

    expect(client.isConnected).toBe(false);
  });

  it('resolves connect() and disconnect() without throwing', async () => {
    const client = new PostgresClient('postgres://localhost:5432/test', createFakeLogger());

    await expect(client.connect()).resolves.toBeUndefined();
    await expect(client.disconnect()).resolves.toBeUndefined();
  });

  it('disconnect() is safe to call even when never connected', async () => {
    const client = new PostgresClient('postgres://localhost:5432/test', createFakeLogger());

    await expect(client.disconnect()).resolves.toBeUndefined();
  });

  it('query() always resolves to an empty array', async () => {
    const client = new PostgresClient('postgres://localhost:5432/test', createFakeLogger());

    await expect(client.query('SELECT 1')).resolves.toEqual([]);
    await expect(client.query('SELECT * FROM users WHERE id = $1', [1])).resolves.toEqual([]);
  });
});
