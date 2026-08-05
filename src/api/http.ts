import { env } from '@/config/env';
import { ApiError } from './errors';

type TokenProvider = () => string | null;

let getToken: TokenProvider = () => null;

/** Wired up by the auth store so the client can attach the bearer token. */
export function setAuthTokenProvider(provider: TokenProvider) {
  getToken = provider;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Idempotency key sent as a header for unsafe, money-moving requests. */
  idempotencyKey?: string;
  signal?: AbortSignal;
  /** Skip attaching the auth token (e.g. login/OTP endpoints). */
  anonymous?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, idempotencyKey, anonymous } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.apiTimeoutMs);

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  if (!anonymous) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const url = `${env.apiBaseUrl.replace(/\/$/, '')}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options.signal ?? controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeout);
    if (err?.name === 'AbortError') {
      throw new ApiError('timeout', 'The request timed out.');
    }
    throw new ApiError('network', 'Network request failed.');
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();
  const data = text ? safeParse(text) : undefined;

  if (!response.ok) {
    throw ApiError.fromStatus(response.status, data);
  }

  return data as T;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
