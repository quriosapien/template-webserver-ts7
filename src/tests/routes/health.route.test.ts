import type { Request, Response } from 'express';
import { describe, expect, it } from 'vitest';
import { HealthController } from '@/controllers/health.controller';
import { createHealthRouter } from '@/routes/health.route';
import type { IHealthService } from '@/types/health.types';

describe('createHealthRouter', () => {
  it('registers exactly one GET / route', () => {
    const controller = new HealthController({} as IHealthService);

    const router = createHealthRouter(controller);

    expect(router.stack).toHaveLength(1);
    expect(router.stack[0]?.route?.path).toBe('/');
    expect(router.stack[0]?.route?.stack[0]?.method).toBe('get');
  });

  it('wires the route handler to controller.check itself, by reference', () => {
    const controller = new HealthController({} as IHealthService);

    const router = createHealthRouter(controller);

    const registeredHandler = router.stack[0]?.route?.stack[0]?.handle as (
      req: Request,
      res: Response,
    ) => Promise<void>;
    expect(registeredHandler).toBe(controller.check);
  });
});
