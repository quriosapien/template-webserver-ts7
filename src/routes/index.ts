import type { Express } from 'express';
import type { Container } from '@/container';
import { createEchoRouter } from '@/routes/echo.route';
import { createHealthRouter } from '@/routes/health.route';

/** Mounts every module router under the /api prefix. */
export function registerRoutes(app: Express, container: Container): void {
  app.use('/api/health', createHealthRouter(container.controllers.health));
  app.use('/api/echo', createEchoRouter(container.controllers.echo));
  // Add future module routers here, e.g.
  // app.use('/api/users', createUserRouter(container.controllers.user));
}
