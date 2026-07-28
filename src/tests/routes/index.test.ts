import type { Express, Router } from 'express';
import { describe, expect, it, vi } from 'vitest';
import type { Container } from '@/container';
import { EchoController } from '@/controllers/echo.controller';
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
  const buildTestContainer = (): Container => ({
    logger: createFakeLogger(),
    clients: [],
    controllers: {
      health: new HealthController({} as IHealthService),
      echo: new EchoController(),
    },
  });

  function findMountedRouter(app: Express, path: string): Router {
    const calls = (app.use as ReturnType<typeof vi.fn>).mock.calls as [string, Router][];
    const match = calls.find(([mountedPath]) => mountedPath === path);
    if (!match) throw new Error(`No router mounted at ${path}`);
    return match[1];
  }

  it('mounts the health router under /api/health', () => {
    const container = buildTestContainer();
    const app = { use: vi.fn() } as unknown as Express;

    registerRoutes(app, container);

    expect(app.use).toHaveBeenCalledWith('/api/health', expect.anything());
  });

  it('mounts the echo router under /api/echo', () => {
    const container = buildTestContainer();
    const app = { use: vi.fn() } as unknown as Express;

    registerRoutes(app, container);

    expect(app.use).toHaveBeenCalledWith('/api/echo', expect.anything());
  });

  it('mounts a router whose GET / handler is the health controller check', () => {
    const container = buildTestContainer();
    const app = { use: vi.fn() } as unknown as Express;

    registerRoutes(app, container);

    const router = findMountedRouter(app, '/api/health');
    expect(router.stack[0]?.route?.stack[0]?.handle).toBe(container.controllers.health.check);
  });

  it('mounts a router whose POST / handler is the echo controller echo', () => {
    const container = buildTestContainer();
    const app = { use: vi.fn() } as unknown as Express;

    registerRoutes(app, container);

    const router = findMountedRouter(app, '/api/echo');
    const stack = router.stack[0]?.route?.stack;
    expect(stack?.[stack.length - 1]?.handle).toBe(container.controllers.echo.echo);
  });
});
