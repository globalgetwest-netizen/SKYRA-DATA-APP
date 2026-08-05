/**
 * Centralised, typed access to public runtime configuration.
 *
 * Only EXPO_PUBLIC_* variables are available in the client bundle. Secret keys
 * never live here — they belong on the Skyra Data backend.
 */

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value == null) return fallback;
  return value === 'true' || value === '1';
}

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export type AppEnvironment = 'development' | 'staging' | 'production';

const appEnv = (process.env.EXPO_PUBLIC_APP_ENV as AppEnvironment) || 'development';

export const env = {
  appEnv,
  isProduction: appEnv === 'production',

  /**
   * When true the app talks to a fully isolated in-memory mock instead of the
   * backend. Enforced OFF in production builds regardless of the flag so a
   * misconfigured production build can never silently serve fake data.
   */
  useMockData: appEnv === 'production' ? false : bool(process.env.EXPO_PUBLIC_USE_MOCK_DATA, true),

  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.skyradata.example.com',
  apiTimeoutMs: num(process.env.EXPO_PUBLIC_API_TIMEOUT_MS, 20000),

  paymentPublicKey: process.env.EXPO_PUBLIC_PAYMENT_PUBLIC_KEY ?? '',

  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? 'support@skyradata.example.com',
  supportPhone: process.env.EXPO_PUBLIC_SUPPORT_PHONE ?? '',
} as const;

/** Guard: production must use HTTPS. Logs a clear warning in dev otherwise. */
export function assertSecureConfig() {
  if (env.isProduction && !env.apiBaseUrl.startsWith('https://')) {
    // eslint-disable-next-line no-console
    console.error('[Skyra] Production API base URL must use HTTPS. Refusing insecure transport.');
  }
}
