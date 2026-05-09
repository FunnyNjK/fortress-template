import { describe, expect, it } from 'vitest';

import { fixtureExternalUserId, fixturePagination } from './index.js';

describe('@fortress/testing', () => {
  it('builds deterministic fixtures', () => {
    expect(fixtureExternalUserId('user')).toBe('user_fixture');
    expect(fixturePagination()).toMatchObject({
      cursor: 'cursor_start',
    });
    expect(fixturePagination({ limit: 25 })).toMatchObject({
      cursor: 'cursor_start',
      limit: 25,
    });
  });
});
