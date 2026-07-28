import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildContainer } from '@/container';
import { createServer } from '@/server';

/**
 * Drives the real Express app (real middleware chain, not hand-mocked req/res)
 * to catch bugs that only surface from middleware interaction/ordering.
 */
describe('GET /api/health (integration)', () => {
  it('responds 200 with the honest health envelope and security/tracing headers', async () => {
    const app = createServer(buildContainer());

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
    expect(response.body.data.checks.length).toBeGreaterThan(0);
    expect(response.body.data.checks[0]).toMatchObject({ status: 'unknown' });
    expect(response.headers['x-request-id']).toBeDefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('honors an inbound x-request-id header', async () => {
    const app = createServer(buildContainer());

    const response = await request(app).get('/api/health').set('x-request-id', 'test-req-id');

    expect(response.headers['x-request-id']).toBe('test-req-id');
  });

  it('responds 404 with the standard failure envelope for unknown routes', async () => {
    const app = createServer(buildContainer());

    const response = await request(app).get('/api/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
