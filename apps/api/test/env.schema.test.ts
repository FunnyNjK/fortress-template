import { describe, expect, it } from 'vitest';

import {
  assertNoPlaceholderSecretsInProduction,
  validateEnv,
} from '../src/config/env.schema.js';

const base = {
  DATABASE_URL: 'postgresql://u:p@127.0.0.1:5432/db',
  REDIS_URL: 'redis://127.0.0.1:6379/0',
  FORTRESS_REQUEST_HMAC_KEY: 'unit-test-fortress-request-hmac-key-32c',
  ALLOW_DEV_AUTH: false,
} as const;

describe('env validation', () => {
  it('parses coerced PORT and respects NODE_ENV', () => {
    const env = validateEnv({
      ...base,
      NODE_ENV: 'test',
      PORT: '4010',
      LOG_LEVEL: 'debug',
    });
    expect(env.PORT).toBe(4010);
    expect(env.NODE_ENV).toBe('test');
    expect(env.LOG_LEVEL).toBe('debug');
  });

  it('rejects invalid PORT', () => {
    expect(() =>
      validateEnv({
        ...base,
        NODE_ENV: 'development',
        PORT: 'not-a-port',
      }),
    ).toThrow();
  });

  it('rejects replace-with-* process env values when NODE_ENV is production', () => {
    const prev = process.env.FORTRESS_PLACEHOLDER_TEST;
    process.env.FORTRESS_PLACEHOLDER_TEST = 'replace-with-unit-test';
    try {
      expect(() =>
        validateEnv({
          ...base,
          NODE_ENV: 'production',
          PORT: 4000,
          LOG_LEVEL: 'info',
        }),
      ).toThrow(/replace-with-/);
    } finally {
      if (prev === undefined) {
        delete process.env.FORTRESS_PLACEHOLDER_TEST;
      } else {
        process.env.FORTRESS_PLACEHOLDER_TEST = prev;
      }
    }
  });

  it('assertNoPlaceholderSecretsInProduction is a no-op outside production', () => {
    expect(() => {
      assertNoPlaceholderSecretsInProduction('development', {
        X: 'replace-with-y',
      });
    }).not.toThrow();
  });
});
