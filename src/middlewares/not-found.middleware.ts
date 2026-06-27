import { HttpStatus } from '@/constants';
import { failure } from '@/helpers/response.helper';
import type { Request, Response } from 'express';

/** Terminal handler for unmatched routes. */
export function notFound(req: Request, res: Response): void {
  res.status(HttpStatus.NOT_FOUND).json(failure(`Route not found: ${req.method} ${req.path}`));
}
