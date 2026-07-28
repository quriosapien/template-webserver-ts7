import { describe, expect, it, vi } from 'vitest';
import { KafkaClient } from '@/db/kafka.client';
import { createFakeLogger } from '@/tests/support/fake-logger';

describe('KafkaClient', () => {
  it('reports its name', () => {
    const client = new KafkaClient(['localhost:9092'], 'test-client', createFakeLogger());

    expect(client.name).toBe('kafka');
  });

  it('is not connected before connect(), and stays disconnected after (stub never sets kafka/producer/consumer)', async () => {
    const client = new KafkaClient(['localhost:9092'], 'test-client', createFakeLogger());

    expect(client.isConnected).toBe(false);
    await client.connect();
    expect(client.isConnected).toBe(false);
  });

  it('resolves connect() and disconnect() without throwing, including when never connected', async () => {
    const client = new KafkaClient(['localhost:9092'], 'test-client', createFakeLogger());

    await expect(client.connect()).resolves.toBeUndefined();
    await expect(client.disconnect()).resolves.toBeUndefined();
    await expect(client.disconnect()).resolves.toBeUndefined();
  });

  it('produce() resolves without throwing', async () => {
    const client = new KafkaClient(['localhost:9092'], 'test-client', createFakeLogger());

    await expect(client.produce('topic', 'message')).resolves.toBeUndefined();
    await expect(client.produce('topic', 'message', 'key')).resolves.toBeUndefined();
  });

  it('consume() resolves without throwing and never invokes the handler', async () => {
    const client = new KafkaClient(['localhost:9092'], 'test-client', createFakeLogger());
    const handler = vi.fn();

    await expect(client.consume('topic', handler)).resolves.toBeUndefined();
    expect(handler).not.toHaveBeenCalled();
  });
});
