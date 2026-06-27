import type { Logger } from 'pino';

// Augment Express's Request with per-request context populated by middleware.
declare global {
  namespace Express {
    interface Request {
      id: string;
      log: Logger;
    }
  }
}
