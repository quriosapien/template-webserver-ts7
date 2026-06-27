import type { Container } from '@/container';
import { createHealthRouter } from '@/modules/health/health.route';
import type { Express } from 'express';

/** Mounts every module router under the /api prefix. */
export function registerRoutes(app: Express, container: Container): void {
  app.use('/api/health', createHealthRouter(container.controllers.health));
  // Add future module routers here, e.g.
  // app.use('/api/users', createUserRouter(container.controllers.user));
}
