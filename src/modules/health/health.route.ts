import type { HealthController } from '@/modules/health/health.controller';
import { Router } from 'express';

/** Builds the health router from an injected controller instance. */
export function createHealthRouter(controller: HealthController): Router {
  const router = Router();
  router.get('/', controller.check);
  return router;
}
