/** Standard, predictable response envelopes for the whole API. */

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    details?: unknown;
  };
}

export function success<T>(data: T): SuccessResponse<T> {
  return { success: true, data };
}

export function failure(message: string, details?: unknown): ErrorResponse {
  return {
    success: false,
    error: details === undefined ? { message } : { message, details },
  };
}
