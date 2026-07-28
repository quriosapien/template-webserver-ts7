import type { Express, Router } from 'express';
import { describe, expect, it, vi } from 'vitest';
import type { Container } from '@/container';
import { HealthController } from '@/controllers/health.controller';
import { registerRoutes } from '@/routes';
import { createFakeLogger } from '@/tests/support/fake-logger';
import type { IHealthService } from '@/types/health.types';

/**
 * Uses a fake `{ use: vi.fn() }` app rather than a real Express instance:
 * Express 5 changed router-mounting internals (app._router -> app.router,
 * no `regexp` on mount layers), so asserting on how a router got mounted
 * onto a real app would be brittle. A Router's own `.stack` shape (see
 * health.route.test.ts) is stable and safe to introspect directly.
 */
describe('registerRoutes', () => {
  it('mounts the health router under /api/health exactly once', () => {
    const controller = new HealthController({} as IHealthService);
    const container: Container = {
      logger: createFakeLogger(),
      clients: [],
      controllers: { health: controller },
    };
    const app = { use: vi.fn() } as unknown as Express;

    registerRoutes(app, container);

    expect(app.use).toHaveBeenCalledOnce();
    expect(app.use).toHaveBeenCalledWith('/api/health', expect.anything());
  });

  it('mounts a router whose GET / handler is the health controller check', () => {
    const controller = new HealthController({} as IHealthService);
    const container: Container = {
      logger: createFakeLogger(),
      clients: [],
      controllers: { health: controller },
    };
    const app = { use: vi.fn() } as unknown as Express;

    registerRoutes(app, container);

    const [, router] = (app.use as ReturnType<typeof vi.fn>).mock.calls[0] as [string, Router];
    expect(router.stack[0]?.route?.stack[0]?.handle).toBe(controller.check);
  });
});
