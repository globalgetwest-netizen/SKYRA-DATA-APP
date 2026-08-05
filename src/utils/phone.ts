import type { NetworkCode } from '@/types';

/**
 * Ghana MSISDN utilities.
 *
 * Ghana uses country code +233 and 9 national significant digits after the
 * leading 0 (e.g. 024 XXX XXXX -> +233 24 XXX XXXX).
 *
 * Prefix -> network mapping below is a best-effort default for pre-selecting a
 * network from a typed number. It is NOT authoritative: numbers can be ported
 * between carriers, so the user can always override the detected network, and
 * the backend performs the final validation before charging.
 */

const NETWORK_PREFIXES: Record<NetworkCode, string[]> = {
  // 2-digit national prefixes (after the leading 0)
  MTN: ['24', '25', '53', '54', '55', '59'],
  TELECEL: ['20', '50'],
  AT: ['26', '27', '56', '57'],
};

/** Strip everything except digits and a leading +. */
export function sanitizePhoneInput(raw: string): string {
  const trimmed = raw.trim();
  const plus = trimmed.startsWith('+') ? '+' : '';
  return plus + trimmed.replace(/[^\d]/g, '');
}

/**
 * Normalise a user-entered Ghana number to E.164 (+233XXXXXXXXX).
 * Accepts: 0241234567, 241234567, +233241234567, 233241234567.
 * Returns null when it can't be confidently normalised.
 */
export function toE164Ghana(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, '');
  let national: string | null = null;

  if (digits.length === 10 && digits.startsWith('0')) {
    national = digits.slice(1); // 0XXXXXXXXX -> XXXXXXXXX
  } else if (digits.length === 9) {
    national = digits; // XXXXXXXXX
  } else if (digits.length === 12 && digits.startsWith('233')) {
    national = digits.slice(3);
  } else if (digits.length === 13 && digits.startsWith('2330')) {
    national = digits.slice(4);
  }

  if (!national || national.length !== 9) return null;
  return `+233${national}`;
}

export function isValidGhanaPhone(raw: string): boolean {
  return toE164Ghana(raw) !== null;
}

/** Detect the likely network from an E.164 or local number. */
export function detectNetwork(raw: string): NetworkCode | null {
  const e164 = toE164Ghana(raw);
  if (!e164) return null;
  const prefix = e164.slice(4, 6); // first two national digits
  for (const [code, prefixes] of Object.entries(NETWORK_PREFIXES) as [NetworkCode, string[]][]) {
    if (prefixes.includes(prefix)) return code;
  }
  return null;
}

/** Pretty local display: +233241234567 -> 024 123 4567 */
export function formatPhoneDisplay(raw: string): string {
  const e164 = toE164Ghana(raw);
  if (!e164) return raw;
  const national = e164.slice(4); // 9 digits
  return `0${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`;
}

/** Masked display for receipts/history: 024 XXX 4567 */
export function maskPhone(raw: string): string {
  const e164 = toE164Ghana(raw);
  if (!e164) return raw;
  const national = e164.slice(4);
  return `0${national.slice(0, 2)} XXX ${national.slice(5)}`;
}
