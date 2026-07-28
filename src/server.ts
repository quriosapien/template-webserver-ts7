import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { config } from '@/config';
import type { Container } from '@/container';
import { errorHandler } from '@/middlewares/error-handler.middleware';
import { notFound } from '@/middlewares/not-found.middleware';
import { createRateLimiter } from '@/middlewares/rate-limit.middleware';
import { requestContext } from '@/middlewares/request-context.middleware';
import { registerRoutes } from '@/routes';

/** Build the Express 5 application from a wired container. */
export function createServer(container: Container): Express {
  const app = express();

  app.disable('x-powered-by');

  // Security headers first.
  app.use(helmet());
  app.use(cors());

  // Per-request id + child logger — must run before anything that can fail
  // (e.g. JSON parsing) so every path that reaches errorHandler has req.log.
  app.use(requestContext(container.logger));

  // Rate limiting before body parsing, so rejected requests skip that cost.
  app.use(createRateLimiter({ windowMs: config.RATE_LIMIT_WINDOW_MS, max: config.RATE_LIMIT_MAX }));

  app.use(express.json());

  // Feature routes.
  registerRoutes(app, container);

  // Fallbacks (order matters: 404 then error handler last).
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
