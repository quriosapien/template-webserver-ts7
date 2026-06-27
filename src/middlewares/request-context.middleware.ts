import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { Logger } from 'pino';

/**
 * Assigns a request id (honouring an inbound `x-request-id`) and attaches a
 * child logger bound to that id, so every log line is traceable per request.
 */
export function requestContext(baseLogger: Logger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const requestId = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
    req.id = requestId;
    req.log = baseLogger.child({ requestId, method: req.method, url: req.url });
    res.setHeader('x-request-id', requestId);
    next();
  };
}
