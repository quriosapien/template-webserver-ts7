import type { Request, Response } from 'express';
import { HttpStatus } from '@/constants';
import { success } from '@/helpers/response.helper';
import type { IHealthService } from '@/types/health.types';

/**
 * Translates HTTP <-> service. Holds no business logic; depends on the service
 * interface so it can be tested with a mock service.
 */
export class HealthController {
  constructor(private readonly service: IHealthService) {}

  // Arrow property keeps `this` bound when used as an Express handler.
  check = async (_req: Request, res: Response): Promise<void> => {
    const health = await this.service.getHealth();
    const code = health.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    res.status(code).json(success(health));
  };
}
