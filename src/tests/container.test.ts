import { describe, expect, it } from 'vitest';
import { buildContainer } from '@/container';
import { DemoController } from '@/controllers/demo.controller';
import { EchoController } from '@/controllers/echo.controller';
import { HealthController } from '@/controllers/health.controller';
import { MemoryCache } from '@/infra/memory-cache';
import { MemoryLock } from '@/infra/memory-lock';

describe('buildContainer', () => {
  it('builds all 5 datastore clients in the expected order', () => {
    const container = buildContainer();

    expect(container.clients.map((client) => client.name)).toEqual([
      'postgres',
      'mongodb',
      'redis',
      'kafka',
      'elasticsearch',
    ]);
  });

  it('wires the health controller', () => {
    const container = buildContainer();

    expect(container.controllers.health).toBeInstanceOf(HealthController);
  });

  it('wires the echo controller', () => {
    const container = buildContainer();

    expect(container.controllers.echo).toBeInstanceOf(EchoController);
  });

  it('wires the demo controller plus process-local cache and locks', () => {
    const container = buildContainer();

    expect(container.controllers.demo).toBeInstanceOf(DemoController);
    expect(container.cache).toBeInstanceOf(MemoryCache);
    expect(container.locks).toBeInstanceOf(MemoryLock);
  });

  it('exposes a logger', () => {
    const container = buildContainer();

    expect(container.logger.info).toBeTypeOf('function');
  });

  it('connects and disconnects every client without throwing (stub-safe smoke check)', async () => {
    const container = buildContainer();

    await Promise.all(container.clients.map((client) => client.connect()));
    await Promise.all(container.clients.map((client) => client.disconnect()));
  });
});
