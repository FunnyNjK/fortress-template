import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { fortressPinoRedactPaths } from '@fortress/observability';

import { AuthModule } from './auth/auth.module.js';
import { AuthenticatedGuard } from './auth/authenticated.guard.js';
import { CsrfGuard, FortressCsrfCookieInterceptor } from './auth/csrf.middleware.js';
import { EnvConfigModule } from './config/config.module.js';
import { DbModule } from './db/db.module.js';
import { RateLimitGuard } from './security/rate-limit.guard.js';
import { SecurityModule } from './security/security.module.js';

@Module({
  imports: [
    EnvConfigModule,
    SecurityModule,
    DbModule,
    AuthModule,
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get<string>('LOG_LEVEL') ?? 'info',
          autoLogging: config.get<string>('NODE_ENV') !== 'test',
          redact: {
            paths: [...fortressPinoRedactPaths()],
            censor: '[redacted]',
          },
        },
      }),
    }),
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthenticatedGuard },
    { provide: APP_GUARD, useClass: RateLimitGuard },
    { provide: APP_GUARD, useClass: CsrfGuard },
    { provide: APP_INTERCEPTOR, useClass: FortressCsrfCookieInterceptor },
  ],
})
export class AppModule {}
