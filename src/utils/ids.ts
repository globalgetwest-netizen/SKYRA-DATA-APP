/**
 * Lightweight id/reference generation. For client-side idempotency keys and
 * mock references only — production references are authoritative from the
 * backend.
 */

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I

function randomBlock(length: number): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/** e.g. generateReference('SKY') -> "SKY-7F3K2A" */
export function generateReference(prefix: string): string {
  return `${prefix}-${randomBlock(6)}`;
}

/**
 * RFC4122-ish v4 identifier used as an idempotency key. Uses crypto when
 * available, otherwise a sufficiently-random fallback.
 */
export function uuid(): string {
  const g: any = globalThis as any;
  if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
