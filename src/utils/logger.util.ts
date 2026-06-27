import { config } from '@/config';
import { type Logger, pino } from 'pino';

/**
 * Root application logger. In non-production stages it pretty-prints; in
 * production it emits structured JSON for log aggregators.
 */
export const logger: Logger = pino({
  level: config.LOG_LEVEL,
  base: { env: config.APP_ENV },
  ...(config.NODE_ENV !== 'production'
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        },
      }
    : {}),
});

/** Create a child logger scoped to a component or request. */
export function createLogger(bindings: Record<string, unknown>): Logger {
  return logger.child(bindings);
}
