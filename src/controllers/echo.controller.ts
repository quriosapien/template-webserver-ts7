import type { Request, Response } from 'express';
import { HttpStatus } from '@/constants';
import { success } from '@/helpers/response.helper';
import type { EchoBody, EchoResponseBody } from '@/types/echo.types';

/**
 * Demo endpoint only, exercising `validate.middleware.ts` end-to-end.
 * `health` remains the canonical controller → service → repository reference
 * — don't copy this thin shape for real features.
 */
export class EchoController {
  // Arrow property keeps `this` bound when used as an Express handler.
  echo = (req: Request, res: Response): void => {
    const { message } = req.body as EchoBody;
    const body: EchoResponseBody = { message, length: message.length };
    res.status(HttpStatus.OK).json(success(body));
  };
}
