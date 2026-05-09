import { describe, expect, it } from 'vitest';

import { FORTRESS_API_VERSION, type ExternalUserId } from './index.js';

describe('@fortress/types', () => {
  it('pins API version', () => {
    expect(FORTRESS_API_VERSION).toBe('0');
  });

  it('allows branded id assignment at boundary', () => {
    const id = 'user_test' as ExternalUserId;
    expect(id).toBe('user_test');
  });
});
