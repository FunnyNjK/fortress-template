import { Buffer } from 'node:buffer';

import { randomOpaqueBytes, timingSafeCompare } from '@fortress/crypto';

/**
 * Canonical API session cookie name for double-submit integrations.
 * Consumers must satisfy `Secure`/`Path`/`__Host-` browser rules independently.
 */
export const FORTRESS_API_SESSION_COOKIE_NAME = '__Host-fs_session' as const;

/** CSRF token header expected on state-changing requests (double-submit). */
export const FORTRESS_CSRF_HEADER_NAME = 'x-fs-csrf-token' as const;

export function encodeBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url');
}

export function decodeBase64Url(value: string): Uint8Array {
  return Uint8Array.from(Buffer.from(value, 'base64url'));
}

/** Generate a cryptographically-strong opaque token for CSRF mitigation. */
export function newOpaqueToken(lengthBytes = 32): string {
  return encodeBase64Url(randomOpaqueBytes(lengthBytes));
}

/** Double-submit verifier: compares cookie/header token payloads in constant time. */
export function verifyDoubleSubmit(cookieToken: string, headerToken: string): boolean {
  const a = Buffer.from(cookieToken, 'utf8');
  const b = Buffer.from(headerToken, 'utf8');

  const av = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
  const bv = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);

  return timingSafeCompare(av, bv);
}
