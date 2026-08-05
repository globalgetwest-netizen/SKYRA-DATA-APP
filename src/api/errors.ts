/** Normalised error surface so the UI can branch on kind, not HTTP internals. */
export type ApiErrorKind =
  | 'network' // no connectivity / request never reached the server
  | 'timeout'
  | 'unauthorized' // 401 — session expired
  | 'forbidden' // 403
  | 'not_found' // 404
  | 'conflict' // 409 — e.g. duplicate/idempotency
  | 'validation' // 422
  | 'rate_limited' // 429
  | 'server' // 5xx
  | 'unknown';

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;
  data?: unknown;

  constructor(kind: ApiErrorKind, message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.data = data;
  }

  get isRetryable() {
    return this.kind === 'network' || this.kind === 'timeout' || this.kind === 'server';
  }

  static fromStatus(status: number, data?: unknown): ApiError {
    const message =
      (typeof data === 'object' && data && 'message' in data && String((data as any).message)) ||
      defaultMessage(status);
    switch (status) {
      case 401:
        return new ApiError('unauthorized', message, status, data);
      case 403:
        return new ApiError('forbidden', message, status, data);
      case 404:
        return new ApiError('not_found', message, status, data);
      case 409:
        return new ApiError('conflict', message, status, data);
      case 422:
        return new ApiError('validation', message, status, data);
      case 429:
        return new ApiError('rate_limited', message, status, data);
      default:
        if (status >= 500) return new ApiError('server', message, status, data);
        return new ApiError('unknown', message, status, data);
    }
  }
}

function defaultMessage(status: number): string {
  if (status >= 500) return 'Something went wrong on our side. Please try again.';
  if (status === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (status === 404) return 'We couldn’t find what you were looking for.';
  return 'The request could not be completed.';
}

/** Human-friendly copy for any error, safe to show directly in the UI. */
export function friendlyMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.kind === 'network') return 'You appear to be offline. Check your connection and try again.';
    if (error.kind === 'timeout') return 'The request timed out. Please try again.';
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
