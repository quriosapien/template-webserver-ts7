import rateLimit, { type RateLimitExceededEventHandler } from 'express-rate-limit';
import { HttpStatus } from '@/constants';
import { failure } from '@/helpers/response.helper';

export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

/**
 * Renders a rate-limited request through the app's own response envelope
 * instead of express-rate-limit's default plain-text body.
 *
 * Default MemoryStore is per-process only — fine for a single-instance
 * deployment, but a horizontally-scaled one would need a shared store (e.g.
 * `rate-limit-redis`, once the stubbed Redis client is implemented).
 */
export const rateLimitExceededHandler: RateLimitExceededEventHandler = (req, res) => {
  req.log.warn({ ip: req.ip }, 'Rate limit exceeded');
  res
    .status(HttpStatus.TOO_MANY_REQUESTS)
    .json(failure('Too many requests, please try again later.'));
};

export function createRateLimiter(config: RateLimitConfig) {
  return rateLimit({
    windowMs: config.windowMs,
    limit: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitExceededHandler,
  });
}
