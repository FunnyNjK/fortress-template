import { describe, expect, it } from 'vitest';

import {
  decryptAes256Gcm,
  encryptAes256Gcm,
  hmacSha256,
  randomOpaqueBytes,
  timingSafeCompare,
} from './index.js';

describe('@fortress/crypto', () => {
  it('round-trips AES-256-GCM with AAD', () => {
    const key = randomOpaqueBytes(32);
    const plaintext = new TextEncoder().encode('hello fortress');
    const aad = new TextEncoder().encode('v1=keyring');

    const box = encryptAes256Gcm(key, plaintext, aad);

    expect(decryptAes256Gcm(key, box, aad)).toEqual(plaintext);
  });

  it('rejects ciphertext when AAD mismatches', () => {
    const key = randomOpaqueBytes(32);
    const box = encryptAes256Gcm(key, new TextEncoder().encode('x'));
    expect(() => decryptAes256Gcm(key, box, new Uint8Array([7]))).toThrow();
  });

  it('compares HMAC deterministically', () => {
    const key = randomOpaqueBytes(32);
    const d = new TextEncoder().encode('payload');
    const a = hmacSha256(key, d);
    const b = Uint8Array.prototype.slice.call(a);
    expect(timingSafeCompare(a, new Uint8Array(b))).toBe(true);
    expect(timingSafeCompare(a, Uint8Array.prototype.slice.call(a, 0, a.length - 1))).toBe(false);
  });
});
