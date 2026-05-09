import { describe, expect, it } from 'vitest';

import {
  encodeBase64Url,
  verifyDoubleSubmit,
  newOpaqueToken,
  decodeBase64Url,
} from './index.js';

describe('@fortress/auth-core', () => {
  it('creates reversible base64url encodings', () => {
    const token = newOpaqueToken(16);

    expect(token.length > 16).toBe(true);
    const bytes = decodeBase64Url(token);
    expect(encodeBase64Url(bytes)).toBe(token);
  });

  it('accepts equal CSRF tokens', () => {
    expect(verifyDoubleSubmit('abc123', 'abc123')).toBe(true);
    expect(verifyDoubleSubmit('abc124', 'abc123')).toBe(false);
  });
});
