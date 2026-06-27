import type { Server } from 'node:http';
import { runWithClustering } from '@/cluster';
import { config } from '@/config';
import { buildContainer } from '@/container';
import { createServer } from '@/server';
import { logger } from '@/utils/logger.util';

/** Boot a single server instance: wire graph → connect stores → listen. */
async function bootstrap(): Promise<void> {
  const container = buildContainer();

  // Open all datastore connections (stubbed for now) before accepting traffic.
  await Promise.all(container.clients.map((client) => client.connect()));

  const app = createServer(container);
  const server: Server = app.listen(config.PORT, () => {
    container.logger.info(
      { port: config.PORT, env: config.APP_ENV, pid: process.pid },
      'server listening',
    );
  });

  registerGracefulShutdown(server, container.clients, container.logger);
}

function registerGracefulShutdown(
  server: Server,
  clients: { disconnect(): Promise<void> }[],
  log: typeof logger,
): void {
  let shuttingDown = false;

  const shutdown = (signal: string): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    log.info({ signal }, 'graceful shutdown initiated');

    server.close(() => {
      Promise.allSettled(clients.map((client) => client.disconnect())).finally(() => {
        log.info('shutdown complete');
        process.exit(0);
      });
    });

    // Hard exit if connections refuse to drain in time.
    setTimeout(() => {
      log.error('forced shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

runWithClustering(bootstrap).catch((err: unknown) => {
  logger.fatal({ err }, 'fatal error during startup');
  process.exit(1);
});
