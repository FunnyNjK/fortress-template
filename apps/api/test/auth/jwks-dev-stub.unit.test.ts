import 'reflect-metadata';

import type { ConfigService } from '@nestjs/config';
import { describe, expect, it } from 'vitest';

import { DevJwksStubVerifier } from '../../src/auth/jwks.dev-stub.js';

function mockConfig(partial: Record<string, unknown>): ConfigService {
  return {
    get: (key: string): unknown => partial[key],
  } as ConfigService;
}

describe('DevJwksStubVerifier', () => {
  it('refuses construction in production', () => {
    expect(
      () => new DevJwksStubVerifier(mockConfig({ NODE_ENV: 'production', ALLOW_DEV_AUTH: true })),
    ).toThrow(/cannot be registered in production/);
  });
});
