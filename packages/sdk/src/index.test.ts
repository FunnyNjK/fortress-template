import { describe, expect, it } from 'vitest';

import { AuthMeResponseSchema, createFortressSdk, normalizeBaseUrl } from './index.js';

describe('@fortress/sdk', () => {
  it('normalizes base URLs', () => {
    expect(normalizeBaseUrl('https://api.example.com/').toString()).toBe('https://api.example.com/');
    expect(normalizeBaseUrl('https://api.example.com').toString()).toBe('https://api.example.com/');
  });

  it('parses /auth/me responses through Zod', async () => {
    const fetchMock: typeof fetch = () =>
      Promise.resolve(
        new Response(JSON.stringify({ clerkUserId: 'user_1', displayName: 'Ada' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

    const sdk = createFortressSdk({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
    });

    await expect(sdk.fetchAuthMe()).resolves.toEqual({
      clerkUserId: 'user_1',
      displayName: 'Ada',
    });
  });

  it('rejects schema drift', () => {
    expect(() =>
      AuthMeResponseSchema.parse({ clerkUserId: 'x', displayName: 1 }),
    ).toThrow();
  });
});
