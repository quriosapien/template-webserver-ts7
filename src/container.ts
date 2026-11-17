import type { Logger } from 'pino';
import { config } from '@/config';
import { DEFAULT_CACHE_TTL_MS } from '@/constants';
import { DemoController } from '@/controllers/demo.controller';
import { EchoController } from '@/controllers/echo.controller';
import { HealthController } from '@/controllers/health.controller';
import { ElasticsearchClient } from '@/db/elasticsearch.client';
import { KafkaClient } from '@/db/kafka.client';
import { MongoDbClient } from '@/db/mongo.client';
import { PostgresClient } from '@/db/postgres.client';
import { RedisClient } from '@/db/redis.client';
import type { DataStoreClient } from '@/db/types';
import { MemoryCache } from '@/infra/memory-cache';
import { MemoryLock } from '@/infra/memory-lock';
import type { Cache, Lock } from '@/infra/types';
import { HealthRepository } from '@/repositories/health.repository';
import { DemoService } from '@/services/demo.service';
import { HealthService } from '@/services/health.service';
import { createLogger } from '@/utils/logger.util';

/**
 * The fully-wired application graph. This is the ONLY place concrete instances
 * are constructed — every layer receives its dependencies via its constructor,
 * which keeps the layers individually unit-testable with mocks.
 */
export interface Container {
  logger: Logger;
  clients: DataStoreClient[];
  cache: Cache;
  locks: Lock;
  controllers: {
    health: HealthController;
    echo: EchoController;
    demo: DemoController;
  };
}

/** Composition root: build datastore clients → repositories → services → controllers. */
export function buildContainer(): Container {
  const logger = createLogger({ component: 'app' });

  // ── Datastore clients (stubbed) ──────────────────────────────────────────
  const postgres = new PostgresClient(config.POSTGRES_URL, logger);
  const mongo = new MongoDbClient(config.MONGO_URL, config.MONGO_DB, logger);
  const redis = new RedisClient(config.REDIS_URL, logger);
  const kafka = new KafkaClient(config.KAFKA_BROKERS, config.KAFKA_CLIENT_ID, logger);
  const elasticsearch = new ElasticsearchClient(config.ELASTICSEARCH_NODE, logger);
  const clients: DataStoreClient[] = [postgres, mongo, redis, kafka, elasticsearch];

  // ── Process-local infra (single-process demos / small deployments) ───────
  const cache = new MemoryCache(DEFAULT_CACHE_TTL_MS);
  const locks = new MemoryLock();

  // ── Health module (repository → service → controller) ────────────────────
  const healthRepository = new HealthRepository(clients);
  const healthService = new HealthService(healthRepository);
  const healthController = new HealthController(healthService);

  // ── Echo module (validation-pattern demo only, see echo.controller.ts) ────
  const echoController = new EchoController();

  // ── Demo module (in-memory cache + locks) ────────────────────────────────
  const demoService = new DemoService(cache, locks, DEFAULT_CACHE_TTL_MS);
  const demoController = new DemoController(demoService);

  return {
    logger,
    clients,
    cache,
    locks,
    controllers: {
      health: healthController,
      echo: echoController,
      demo: demoController,
    },
  };
}
