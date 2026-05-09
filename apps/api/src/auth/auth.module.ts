import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SecurityModule } from '../security/security.module.js';

import { AuditService } from './audit.service.js';
import { AuthController } from './auth.controller.js';
import { AuthenticatedGuard } from './authenticated.guard.js';
import { CsrfGuard, FortressCsrfCookieInterceptor } from './csrf.middleware.js';
import { DevJwksStubVerifier } from './jwks.dev-stub.js';
import { JWKS_VERIFIER } from './jwks.tokens.js';
import type { JwksVerifier } from './jwks.verifier.js';
import { UnsupportedProductionJwksVerifier } from './jwks.verifier.js';
import { SessionService } from './session.service.js';

const jwksVerifierProvider = {
  provide: JWKS_VERIFIER,
  inject: [ConfigService],
  useFactory: (config: ConfigService): JwksVerifier => {
    if (config.get<string>('NODE_ENV') === 'production') {
      return new UnsupportedProductionJwksVerifier();
    }
    return new DevJwksStubVerifier(config);
  },
};

@Module({
  imports: [SecurityModule],
  controllers: [AuthController],
  providers: [
    AuditService,
    SessionService,
    AuthenticatedGuard,
    CsrfGuard,
    FortressCsrfCookieInterceptor,
    jwksVerifierProvider,
  ],
  exports: [
    AuditService,
    SessionService,
    AuthenticatedGuard,
    CsrfGuard,
    FortressCsrfCookieInterceptor,
    jwksVerifierProvider,
  ],
})
export class AuthModule {}
