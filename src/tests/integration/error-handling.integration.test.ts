import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildContainer } from '@/container';
import { createServer } from '@/server';

/**
 * Drives the real Express app (real middleware chain, not hand-mocked req/res)
 * to catch bugs that only surface from middleware interaction/ordering.
 */
describe('error handling (integration)', () => {
  it('responds with a clean 400 JSON envelope for malformed JSON instead of crashing', async () => {
    const app = createServer(buildContainer());

    const response = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send('{ this is not valid json');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
