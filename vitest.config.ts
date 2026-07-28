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
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.types.ts', 'src/tests/support/**'],
    },
  },
});
