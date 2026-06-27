import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import { config } from '@/config';
import { logger } from '@/utils/logger.util';

/**
 * Multi-core strategy.
 *
 * - CLUSTER_ENABLED=false (default): run `start` in the current single process.
 *   Prefer this in containers and scale out with orchestrator replicas.
 * - CLUSTER_ENABLED=true: the primary forks one worker per CPU core (and
 *   restarts any that die); each worker runs `start`. Use on a single host/VM.
 */
export async function runWithClustering(start: () => Promise<void>): Promise<void> {
  if (!config.CLUSTER_ENABLED) {
    await start();
    return;
  }

  if (cluster.isPrimary) {
    const workerCount = availableParallelism();
    logger.info({ workerCount }, 'primary process forking workers');

    for (let i = 0; i < workerCount; i += 1) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      logger.warn(
        { pid: worker.process.pid, code, signal },
        'worker exited — forking a replacement',
      );
      cluster.fork();
    });
    return;
  }

  await start();
}
