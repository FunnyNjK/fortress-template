import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Request } from 'express';

import type { FortressJwtClaims, JwksVerifier } from './jwks.verifier.js';

/** Dev-only claims source: `x-debug-user-id` + fabricated JWT fields. */
@Injectable()
export class DevJwksStubVerifier implements JwksVerifier {
  constructor(private readonly config: ConfigService) {
    if (this.config.get<string>('NODE_ENV') === 'production') {
      throw new Error('DevJwksStubVerifier cannot be registered in production');
    }
  }

  verify(request: Request, bearerToken: string): Promise<FortressJwtClaims> {
    void bearerToken;
    if (!this.config.get<boolean>('ALLOW_DEV_AUTH')) {
      throw new Error('ALLOW_DEV_AUTH is disabled');
    }
    const raw = request.headers['x-debug-user-id'];
    if (typeof raw !== 'string' || raw.length === 0) {
      throw new Error('Missing x-debug-user-id for dev auth stub');
    }
    const now = Math.floor(Date.now() / 1000);
    return Promise.resolve({
      sub: raw,
      iss: 'dev',
      exp: now + 3600,
      iat: now,
    });
  }
}
