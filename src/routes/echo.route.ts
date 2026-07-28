import { Router } from 'express';
import type { EchoController } from '@/controllers/echo.controller';
import { validate } from '@/middlewares/validate.middleware';
import { echoBodySchema } from '@/types/echo.types';

/** Builds the echo router from an injected controller instance. */
export function createEchoRouter(controller: EchoController): Router {
  const router = Router();
  router.post('/', validate({ body: echoBodySchema }), controller.echo);
  return router;
}
