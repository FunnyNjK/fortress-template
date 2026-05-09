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
        new Response(JSON.stringify({ id: '550e8400-e29b-41d4-a716-446655440001', clerkUserId: 'user_1' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

    const sdk = createFortressSdk({
      baseUrl: 'https://api.example.com',
      fetch: fetchMock,
    });

    await expect(sdk.fetchAuthMe()).resolves.toEqual({
      id: '550e8400-e29b-41d4-a716-446655440001',
      clerkUserId: 'user_1',
    });
  });

  it('rejects schema drift', () => {
    expect(() =>
      AuthMeResponseSchema.parse({ id: 'not-a-uuid', clerkUserId: 'x' }),
    ).toThrow();
  });
});
