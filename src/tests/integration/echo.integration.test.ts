import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildContainer } from '@/container';
import { createServer } from '@/server';

/**
 * Drives the real Express app (real middleware chain, not hand-mocked req/res)
 * to catch bugs that only surface from middleware interaction/ordering.
 */
describe('POST /api/echo (integration)', () => {
  it('responds 200 with the message and its length for a valid body', async () => {
    const app = createServer(buildContainer());

    const response = await request(app).post('/api/echo').send({ message: 'hello' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, data: { message: 'hello', length: 5 } });
  });

  it('responds 400 with Zod issue details for an invalid body', async () => {
    const app = createServer(buildContainer());

    const response = await request(app).post('/api/echo').send({ message: '' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.details).toBeDefined();
  });

  it('responds 429 once the rate limit is exceeded', async () => {
    const app = createServer(buildContainer());
    // vitest.config.ts sets RATE_LIMIT_MAX=3 for tests.
    for (let i = 0; i < 3; i++) {
      const ok = await request(app).post('/api/echo').send({ message: 'hi' });
      expect(ok.status).toBe(200);
    }

    const limited = await request(app).post('/api/echo').send({ message: 'hi' });

    expect(limited.status).toBe(429);
    expect(limited.body).toEqual({
      success: false,
      error: { message: 'Too many requests, please try again later.' },
    });
  });
});
