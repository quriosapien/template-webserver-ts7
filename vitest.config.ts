import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      POSTGRES_URL: 'postgres://user:pass@localhost:5432/test',
      MONGO_URL: 'mongodb://localhost:27017',
      MONGO_DB: 'test',
      REDIS_URL: 'redis://localhost:6379',
      KAFKA_BROKERS: 'localhost:9092',
      KAFKA_CLIENT_ID: 'template-ts7-test',
      ELASTICSEARCH_NODE: 'http://localhost:9200',
      // Low ceiling so integration tests can trigger a 429 deterministically
      // in a handful of requests instead of the production default (100).
      RATE_LIMIT_MAX: '3',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      // index.ts/cluster.ts are process-bootstrap glue (app.listen, SIGTERM
      // handling, cluster.fork) — meaningfully testing them needs real
      // process spawning (E2E), not unit tests.
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.types.ts',
        'src/tests/support/**',
        'src/index.ts',
        'src/cluster.ts',
      ],
      // Ratchet, not aspirational: set a few points below the observed
      // baseline (98.34/89.79/98.46/98.87 at the time this was added) so CI
      // catches regressions without being a moving target for every PR.
      thresholds: {
        statements: 95,
        branches: 85,
        functions: 95,
        lines: 95,
      },
    },
  },
});
