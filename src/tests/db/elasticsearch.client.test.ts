import { describe, expect, it } from 'vitest';
import { ElasticsearchClient } from '@/db/elasticsearch.client';
import { createFakeLogger } from '@/tests/support/fake-logger';

describe('ElasticsearchClient', () => {
  it('reports its name', () => {
    const client = new ElasticsearchClient('http://localhost:9200', createFakeLogger());

    expect(client.name).toBe('elasticsearch');
  });

  it('is not connected before connect(), and stays disconnected after (stub never sets the client)', async () => {
    const client = new ElasticsearchClient('http://localhost:9200', createFakeLogger());

    expect(client.isConnected).toBe(false);
    await client.connect();
    expect(client.isConnected).toBe(false);
  });

  it('resolves connect() and disconnect() without throwing, including when never connected', async () => {
    const client = new ElasticsearchClient('http://localhost:9200', createFakeLogger());

    await expect(client.connect()).resolves.toBeUndefined();
    await expect(client.disconnect()).resolves.toBeUndefined();
    await expect(client.disconnect()).resolves.toBeUndefined();
  });

  it('index() returns the given id when provided', async () => {
    const client = new ElasticsearchClient('http://localhost:9200', createFakeLogger());

    await expect(client.index('users', { name: 'ada' }, 'user-1')).resolves.toBe('user-1');
  });

  it('index() returns a stub id when no id is provided', async () => {
    const client = new ElasticsearchClient('http://localhost:9200', createFakeLogger());

    await expect(client.index('users', { name: 'ada' })).resolves.toBe('stub-id');
  });

  it('search() always resolves to an empty array', async () => {
    const client = new ElasticsearchClient('http://localhost:9200', createFakeLogger());

    await expect(client.search('users', { match_all: {} })).resolves.toEqual([]);
  });
});
