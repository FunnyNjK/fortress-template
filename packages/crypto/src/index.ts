import { Buffer } from 'node:buffer';
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

const AES_KEY_BYTES = 32;
const GCM_IV_BYTES = 12;
const GCM_TAG_BYTES = 16;

/** Raw AES-GCM ciphertext bundle: `[iv][ciphertext][tag]` (opaque bytes). */
export type AesGcmSecretBox = Uint8Array;

/** @throws RangeError when sizes are unexpected. */
export function encryptAes256Gcm(
  key: Uint8Array,
  plaintext: Uint8Array,
  aad?: Uint8Array,
): AesGcmSecretBox {
  if (key.byteLength !== AES_KEY_BYTES) throw new RangeError('AES-GCM key must be 32 bytes');

  const iv = randomBytes(GCM_IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  const aBuf = Buffer.from(aad ?? new Uint8Array(0));

  cipher.setAAD(aBuf);

  const ciphertext = Buffer.concat([cipher.update(Buffer.from(plaintext)), cipher.final()]);
  const tag = cipher.getAuthTag();

  const out = Buffer.alloc(iv.length + ciphertext.length + tag.length);
  out.set(iv, 0);
  out.set(ciphertext, iv.length);
  out.set(tag, iv.length + ciphertext.length);

  return out;
}

/** @throws when authentication fails or input is malformed. */
export function decryptAes256Gcm(
  key: Uint8Array,
  box: Uint8Array,
  aad?: Uint8Array,
): Uint8Array {
  if (key.byteLength !== AES_KEY_BYTES) throw new RangeError('AES-GCM key must be 32 bytes');
  if (box.byteLength <= GCM_IV_BYTES + GCM_TAG_BYTES)
    throw new RangeError('Ciphertext shorter than iv+tag overhead');

  const iv = Uint8Array.prototype.slice.call(box, 0, GCM_IV_BYTES);

  const tagStart = box.byteLength - GCM_TAG_BYTES;
  const tag = Uint8Array.prototype.slice.call(box, tagStart);
  const rawCt = Uint8Array.prototype.slice.call(box, GCM_IV_BYTES, tagStart);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(Buffer.from(tag));

  decipher.setAAD(Buffer.from(aad ?? new Uint8Array(0)));

  return new Uint8Array(Buffer.concat([decipher.update(Buffer.from(rawCt)), decipher.final()]));
}

export function hmacSha256(key: Uint8Array, data: Uint8Array): Uint8Array {
  return new Uint8Array(createHmac('sha256', Buffer.from(key)).update(Buffer.from(data)).digest());
}

export function timingSafeCompare(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function randomOpaqueBytes(length: number): Uint8Array {
  if (!Number.isInteger(length) || length <= 0) throw new RangeError('length must be a positive integer');
  return randomBytes(length);
}
