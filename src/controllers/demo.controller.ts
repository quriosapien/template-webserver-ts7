import type { Request, Response } from 'express';
import { DEFAULT_CACHE_TTL_MS, HttpStatus } from '@/constants';
import { success } from '@/helpers/response.helper';
import type {
  DemoCacheKeyParams,
  DemoCacheSetBody,
  DemoLockAcquireBody,
  DemoLockNameParams,
  DemoLockReleaseBody,
  IDemoService,
} from '@/types/demo.types';

/**
 * HTTP translation for the in-memory cache + lock demo.
 * Business rules live in `DemoService`; validation is handled by middleware.
 */
export class DemoController {
  constructor(private readonly service: IDemoService) {}

  getCache = (req: Request, res: Response): void => {
    const { key } = req.params as DemoCacheKeyParams;
    const entry = this.service.getCache(key);
    res.status(HttpStatus.OK).json(success(entry));
  };

  setCache = (req: Request, res: Response): void => {
    const { key } = req.params as DemoCacheKeyParams;
    const { value, ttlMs } = req.body as DemoCacheSetBody;
    const entry = this.service.setCache(key, value, ttlMs ?? DEFAULT_CACHE_TTL_MS);
    res.status(HttpStatus.OK).json(success(entry));
  };

  deleteCache = (req: Request, res: Response): void => {
    const { key } = req.params as DemoCacheKeyParams;
    this.service.deleteCache(key);
    res.status(HttpStatus.NO_CONTENT).send();
  };

  acquireLock = async (req: Request, res: Response): Promise<void> => {
    const { name } = req.params as DemoLockNameParams;
    const { timeoutMs } = (req.body ?? {}) as DemoLockAcquireBody;
    const held = await this.service.acquireLock(name, timeoutMs);
    res.status(HttpStatus.OK).json(success(held));
  };

  releaseLock = (req: Request, res: Response): void => {
    const { name } = req.params as DemoLockNameParams;
    const { lockId } = req.body as DemoLockReleaseBody;
    this.service.releaseLock(name, lockId);
    res.status(HttpStatus.NO_CONTENT).send();
  };

  getLockStatus = (req: Request, res: Response): void => {
    const { name } = req.params as DemoLockNameParams;
    const status = this.service.getLockStatus(name);
    res.status(HttpStatus.OK).json(success(status));
  };
}
