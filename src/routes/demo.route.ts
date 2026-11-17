import { Router } from 'express';
import type { DemoController } from '@/controllers/demo.controller';
import { validate } from '@/middlewares/validate.middleware';
import {
  demoCacheKeyParamsSchema,
  demoCacheSetBodySchema,
  demoLockAcquireBodySchema,
  demoLockNameParamsSchema,
  demoLockReleaseBodySchema,
} from '@/types/demo.types';

/** Builds the `/api/demo` router from an injected controller instance. */
export function createDemoRouter(controller: DemoController): Router {
  const router = Router();

  router.put(
    '/cache/:key',
    validate({ params: demoCacheKeyParamsSchema, body: demoCacheSetBodySchema }),
    controller.setCache,
  );
  router.get('/cache/:key', validate({ params: demoCacheKeyParamsSchema }), controller.getCache);
  router.delete(
    '/cache/:key',
    validate({ params: demoCacheKeyParamsSchema }),
    controller.deleteCache,
  );

  router.post(
    '/locks/:name/acquire',
    validate({ params: demoLockNameParamsSchema, body: demoLockAcquireBodySchema }),
    controller.acquireLock,
  );
  router.post(
    '/locks/:name/release',
    validate({ params: demoLockNameParamsSchema, body: demoLockReleaseBodySchema }),
    controller.releaseLock,
  );
  router.get(
    '/locks/:name',
    validate({ params: demoLockNameParamsSchema }),
    controller.getLockStatus,
  );

  return router;
}
