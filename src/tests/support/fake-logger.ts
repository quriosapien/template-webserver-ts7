import type { Logger } from 'pino';
import { vi } from 'vitest';

/** Minimal pino-shaped fake covering only the methods production code calls. */
export function createFakeLogger(): Logger {
  const logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => createFakeLogger()),
  };
  return logger as unknown as Logger;
}
