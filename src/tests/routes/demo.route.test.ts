import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { DemoController } from '@/controllers/demo.controller';
import { createDemoRouter } from '@/routes/demo.route';
import type { IDemoService } from '@/types/demo.types';

describe('createDemoRouter', () => {
  const controller = new DemoController({} as IDemoService);

  it('registers the six demo routes', () => {
    const router = createDemoRouter(controller);

    expect(router.stack).toHaveLength(6);
    const paths = router.stack.map((layer) => layer.route?.path);
    expect(paths).toEqual([
      '/cache/:key',
      '/cache/:key',
      '/cache/:key',
      '/locks/:name/acquire',
      '/locks/:name/release',
      '/locks/:name',
    ]);
  });

  it('wires handlers to the controller methods by reference', () => {
    const router = createDemoRouter(controller);
    const putStack = router.stack[0]?.route?.stack;
    const putHandler = putStack?.[putStack.length - 1]?.handle as (
      req: Request,
      res: Response,
    ) => void;

    expect(putHandler).toBe(controller.setCache);
  });

  it('keeps validate middleware ahead of the controller on mutating routes', () => {
    const router = createDemoRouter(controller);
    const putLayer = router.stack[0]?.route;
    expect(putLayer?.stack).toHaveLength(2);
    expect(putLayer?.stack[0]?.handle).not.toBe(controller.setCache);
    expect(vi.isMockFunction(putLayer?.stack[0]?.handle)).toBe(false);
  });
});
