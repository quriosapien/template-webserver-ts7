import type { Request, Response } from 'express';
import { vi } from 'vitest';

export function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    method: 'GET',
    path: '/',
    headers: {},
    ...overrides,
  } as Request;
}

/** Chainable status().json() like Express's real Response. */
export function createMockResponse(): Response {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    setHeader: vi.fn(),
  };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  res.setHeader.mockReturnValue(res);
  return res as unknown as Response;
}
