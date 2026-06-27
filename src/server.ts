import type { Container } from '@/container';
import { errorHandler } from '@/middlewares/error-handler.middleware';
import { notFound } from '@/middlewares/not-found.middleware';
import { requestContext } from '@/middlewares/request-context.middleware';
import { registerRoutes } from '@/routes';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

/** Build the Express 5 application from a wired container. */
export function createServer(container: Container): Express {
  const app = express();

  app.disable('x-powered-by');

  // Security & parsing middleware.
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Per-request id + child logger.
  app.use(requestContext(container.logger));

  // Feature routes.
  registerRoutes(app, container);

  // Fallbacks (order matters: 404 then error handler last).
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
