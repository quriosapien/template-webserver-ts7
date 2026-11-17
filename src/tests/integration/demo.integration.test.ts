import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { DEFAULT_CACHE_TTL_MS } from '@/constants';
import { buildContainer } from '@/container';
import { createServer } from '@/server';

describe('/api/demo (integration)', () => {
  it('sets and gets a cache entry with the default 5-minute TTL', async () => {
    const app = createServer(buildContainer());

    const put = await request(app).put('/api/demo/cache/greeting').send({ value: 'hello' });
    expect(put.status).toBe(200);
    expect(put.body).toEqual({
      success: true,
      data: { key: 'greeting', value: 'hello', ttlMs: DEFAULT_CACHE_TTL_MS },
    });

    const get = await request(app).get('/api/demo/cache/greeting');
    expect(get.status).toBe(200);
    expect(get.body.data).toEqual({
      key: 'greeting',
      value: 'hello',
      ttlMs: DEFAULT_CACHE_TTL_MS,
    });
  });

  it('returns 404 for a missing cache key', async () => {
    const app = createServer(buildContainer());

    const response = await request(app).get('/api/demo/cache/missing');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('acquires and releases a named lock', async () => {
    // vitest.config.ts sets RATE_LIMIT_MAX=3 — keep this case ≤3 requests.
    const app = createServer(buildContainer());

    const acquire = await request(app).post('/api/demo/locks/order/acquire').send({});
    expect(acquire.status).toBe(200);
    expect(acquire.body.data.name).toBe('order');
    expect(acquire.body.data.lockId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    const release = await request(app)
      .post('/api/demo/locks/order/release')
      .send({ lockId: acquire.body.data.lockId });
    expect(release.status).toBe(204);

    const after = await request(app).get('/api/demo/locks/order');
    expect(after.body.data).toEqual({ name: 'order', locked: false });
  });

  it('returns 409 when a lock acquire times out', async () => {
    const app = createServer(buildContainer());

    const first = await request(app).post('/api/demo/locks/busy/acquire').send({});
    expect(first.status).toBe(200);

    const second = await request(app).post('/api/demo/locks/busy/acquire').send({ timeoutMs: 30 });

    expect(second.status).toBe(409);
    expect(second.body.success).toBe(false);
  });
});
