import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

/**
 * Resolve which `.env.<stage>` file to load. The stage is driven by APP_ENV so
 * the same build can run against local / development / test / staging /
 * production simply by changing one variable.
 *
 * Loading uses Node's native env-file parser (`process.loadEnvFile`), so there
 * is no `dotenv` dependency.
 */
const APP_ENV = process.env.APP_ENV ?? 'local';
const envFile = resolve(process.cwd(), `.env.${APP_ENV}`);

if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}
// else: no file (staging/production) — rely on orchestrator-injected process.env.
// Zod validation below still guards correctness.

const booleanString = z.enum(['true', 'false']).transform((value) => value === 'true');

/** Single source of truth for every environment variable the app consumes. */
const envSchema = z.object({
  // Two independent axes, intentionally not derived from each other:
  //   APP_ENV  = which values/secrets to source (e.g. test → test.template.website).
  //   NODE_ENV = build/compilation mode; test, staging and production all build as `production`.
  APP_ENV: z.enum(['local', 'development', 'test', 'staging', 'production']).default('local'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CLUSTER_ENABLED: booleanString.default(false),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  // PostgreSQL
  POSTGRES_URL: z.url(),

  // MongoDB
  MONGO_URL: z.url(),
  MONGO_DB: z.string().min(1),

  // Redis
  REDIS_URL: z.url(),

  // Kafka
  KAFKA_BROKERS: z
    .string()
    .min(1)
    .transform((value) => value.split(',').map((broker) => broker.trim())),
  KAFKA_CLIENT_ID: z.string().min(1),

  // Elasticsearch
  ELASTICSEARCH_NODE: z.url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast with a readable report instead of crashing deep inside the app.
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration (APP_ENV=${APP_ENV}):\n${issues}`);
}

/** Validated, typed, immutable configuration. The only place env is read. */
export const config = Object.freeze(parsed.data);

export type Config = typeof config;
