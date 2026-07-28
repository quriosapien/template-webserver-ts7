import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * config/env.ts validates process.env at *import time*, so every scenario
 * here stubs env vars then dynamically re-imports the module after
 * vi.resetModules(). vi.stubEnv/vi.unstubAllEnvs keep this isolated from
 * other test files and from a developer's local .env.test, if any.
 */
const REQUIRED_ENV: Record<string, string> = {
  POSTGRES_URL: 'postgres://user:pass@localhost:5432/test',
  MONGO_URL: 'mongodb://localhost:27017',
  MONGO_DB: 'test',
  REDIS_URL: 'redis://localhost:6379',
  KAFKA_BROKERS: 'broker-a:9092,broker-b:9092',
  KAFKA_CLIENT_ID: 'test-client',
  ELASTICSEARCH_NODE: 'http://localhost:9200',
};

function stubRequiredEnv(overrides: Record<string, string | undefined> = {}): void {
  for (const [key, value] of Object.entries({ ...REQUIRED_ENV, ...overrides })) {
    vi.stubEnv(key, value);
  }
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('config/env', () => {
  it('parses successfully and freezes the config when all required vars are present', async () => {
    stubRequiredEnv();

    const { config } = await import('@/config/env');

    expect(Object.isFrozen(config)).toBe(true);
    expect(config.MONGO_DB).toBe('test');
  });

  it('throws a readable error when a required var is missing', async () => {
    stubRequiredEnv({ POSTGRES_URL: undefined });

    await expect(import('@/config/env')).rejects.toThrow(/POSTGRES_URL/);
  });

  it('throws when a URL-typed var is not a valid URL', async () => {
    stubRequiredEnv({ POSTGRES_URL: 'not-a-url' });

    await expect(import('@/config/env')).rejects.toThrow(/Invalid environment configuration/);
  });

  it('throws when a required non-empty string is empty', async () => {
    stubRequiredEnv({ MONGO_DB: '' });

    await expect(import('@/config/env')).rejects.toThrow(/Invalid environment configuration/);
  });

  it('splits and trims KAFKA_BROKERS into an array', async () => {
    stubRequiredEnv({ KAFKA_BROKERS: 'broker-a:9092, broker-b:9092' });

    const { config } = await import('@/config/env');

    expect(config.KAFKA_BROKERS).toEqual(['broker-a:9092', 'broker-b:9092']);
  });

  it('applies defaults and coerces types for optional vars when unset', async () => {
    stubRequiredEnv({
      APP_ENV: undefined,
      NODE_ENV: undefined,
      PORT: undefined,
      LOG_LEVEL: undefined,
      CLUSTER_ENABLED: undefined,
      RATE_LIMIT_WINDOW_MS: undefined,
      RATE_LIMIT_MAX: undefined,
    });

    const { config } = await import('@/config/env');

    expect(config.APP_ENV).toBe('local');
    expect(config.NODE_ENV).toBe('development');
    expect(config.PORT).toBe(3000);
    expect(config.LOG_LEVEL).toBe('info');
    expect(config.CLUSTER_ENABLED).toBe(false);
    expect(config.RATE_LIMIT_WINDOW_MS).toBe(15 * 60 * 1000);
    expect(config.RATE_LIMIT_MAX).toBe(100);
  });

  it('coerces RATE_LIMIT_WINDOW_MS and RATE_LIMIT_MAX to numbers when set', async () => {
    stubRequiredEnv({ RATE_LIMIT_WINDOW_MS: '60000', RATE_LIMIT_MAX: '10' });

    const { config } = await import('@/config/env');

    expect(config.RATE_LIMIT_WINDOW_MS).toBe(60000);
    expect(config.RATE_LIMIT_MAX).toBe(10);
  });
});
