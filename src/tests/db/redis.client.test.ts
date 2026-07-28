import { describe, expect, it } from 'vitest';
import { RedisClient } from '@/db/redis.client';
import { createFakeLogger } from '@/tests/support/fake-logger';

describe('RedisClient', () => {
  it('reports its name', () => {
    const client = new RedisClient('redis://localhost:6379', createFakeLogger());

    expect(client.name).toBe('redis');
  });

  it('is not connected before connect(), and stays disconnected after (stub never sets the client)', async () => {
    const client = new RedisClient('redis://localhost:6379', createFakeLogger());

    expect(client.isConnected).toBe(false);
    await client.connect();
    expect(client.isConnected).toBe(false);
  });

  it('resolves connect() and disconnect() without throwing, including when never connected', async () => {
    const client = new RedisClient('redis://localhost:6379', createFakeLogger());

    await expect(client.connect()).resolves.toBeUndefined();
    await expect(client.disconnect()).resolves.toBeUndefined();
    await expect(client.disconnect()).resolves.toBeUndefined();
  });

  it('get() always resolves to null', async () => {
    const client = new RedisClient('redis://localhost:6379', createFakeLogger());

    await expect(client.get('key')).resolves.toBeNull();
  });

  it('set() resolves with and without a ttl', async () => {
    const client = new RedisClient('redis://localhost:6379', createFakeLogger());

    await expect(client.set('key', 'value')).resolves.toBeUndefined();
    await expect(client.set('key', 'value', 60)).resolves.toBeUndefined();
  });

  it('del() always resolves to false', async () => {
    const client = new RedisClient('redis://localhost:6379', createFakeLogger());

    await expect(client.del('key')).resolves.toBe(false);
  });
});
