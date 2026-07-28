import { z } from 'zod';

/**
 * Demo endpoint only, exercising `validate.middleware.ts` end-to-end.
 * `health` remains the canonical controller → service → repository reference
 * — don't copy this thin shape for real features.
 */
export const echoBodySchema = z.object({
  message: z.string().min(1).max(500),
});

export type EchoBody = z.infer<typeof echoBodySchema>;

export interface EchoResponseBody {
  message: string;
  length: number;
}
