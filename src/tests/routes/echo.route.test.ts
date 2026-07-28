import type { Request, Response } from 'express';
import { describe, expect, it } from 'vitest';
import { EchoController } from '@/controllers/echo.controller';
import { createEchoRouter } from '@/routes/echo.route';

describe('createEchoRouter', () => {
  it('registers exactly one POST / route', () => {
    const controller = new EchoController();

    const router = createEchoRouter(controller);

    expect(router.stack).toHaveLength(1);
    expect(router.stack[0]?.route?.path).toBe('/');
    // The route's handler stack is [validate middleware, controller.echo].
    expect(router.stack[0]?.route?.stack).toHaveLength(2);
    expect(router.stack[0]?.route?.stack[0]?.method).toBe('post');
  });

  it('wires the final handler to controller.echo itself, by reference', () => {
    const controller = new EchoController();

    const router = createEchoRouter(controller);

    const stack = router.stack[0]?.route?.stack;
    const registeredHandler = stack?.[stack.length - 1]?.handle as (
      req: Request,
      res: Response,
    ) => void;
    expect(registeredHandler).toBe(controller.echo);
  });
});
