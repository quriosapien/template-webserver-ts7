import { describe, expect, it, vi } from 'vitest';
import { HttpStatus } from '@/constants';
import { HealthController } from '@/controllers/health.controller';
import { createMockRequest, createMockResponse } from '@/tests/support/express-mocks';
import type { HealthStatus, IHealthService } from '@/types/health.types';

const makeService = (health: HealthStatus): IHealthService => ({
  getHealth: vi.fn().mockResolvedValue(health),
});

describe('HealthController', () => {
  it('responds 200 with the health envelope when status is ok', async () => {
    const health: HealthStatus = {
      status: 'ok',
      uptimeSeconds: 12,
      timestamp: '2026-01-01T00:00:00.000Z',
      checks: [],
    };
    const controller = new HealthController(makeService(health));
    const req = createMockRequest();
    const res = createMockResponse();

    await controller.check(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: health });
  });

  it('responds 503 when status is degraded, keeping the success envelope true', async () => {
    const health: HealthStatus = {
      status: 'degraded',
      uptimeSeconds: 12,
      timestamp: '2026-01-01T00:00:00.000Z',
      checks: [{ name: 'kafka', status: 'unhealthy' }],
    };
    const controller = new HealthController(makeService(health));
    const req = createMockRequest();
    const res = createMockResponse();

    await controller.check(req, res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: health });
  });

  it('calls getHealth() exactly once per invocation', async () => {
    const health: HealthStatus = {
      status: 'ok',
      uptimeSeconds: 0,
      timestamp: '2026-01-01T00:00:00.000Z',
      checks: [],
    };
    const service = makeService(health);
    const controller = new HealthController(service);

    await controller.check(createMockRequest(), createMockResponse());

    expect(service.getHealth).toHaveBeenCalledOnce();
  });

  it('works when check is detached from the controller instance (arrow-property binding)', async () => {
    const health: HealthStatus = {
      status: 'ok',
      uptimeSeconds: 0,
      timestamp: '2026-01-01T00:00:00.000Z',
      checks: [],
    };
    const controller = new HealthController(makeService(health));
    const { check } = controller;
    const res = createMockResponse();

    await check(createMockRequest(), res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
  });
});
