import { describe, expect, it } from 'vitest';
import { config } from '@/config';
import { createLogger, logger } from '@/utils/logger.util';

describe('logger', () => {
  it('exposes the expected pino API surface', () => {
    expect(logger.info).toBeTypeOf('function');
    expect(logger.warn).toBeTypeOf('function');
    expect(logger.error).toBeTypeOf('function');
    expect(logger.debug).toBeTypeOf('function');
    expect(logger.child).toBeTypeOf('function');
  });

  it('is configured with the level from config.LOG_LEVEL', () => {
    expect(logger.level).toBe(config.LOG_LEVEL);
  });
});

describe('createLogger', () => {
  it('returns a child logger bound to the given bindings', () => {
    const child = createLogger({ component: 'test' });

    expect(child.bindings()).toMatchObject({ component: 'test' });
  });
});
