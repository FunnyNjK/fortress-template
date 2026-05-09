import { MiddlewareConsumer, Module, NestModule, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR, DiscoveryModule } from '@nestjs/core';
import { fortressPinoRedactPaths } from '@fortress/observability';
import type { Redis } from 'ioredis';
import pino from 'pino';

import { BodyLimitRegistry } from './body-limit.registry.js';
import { DynamicJsonBodyMiddleware } from './dynamic-json.middleware.js';
import { FortressExceptionFilter } from './exception.filter.js';
import { SecurityHeadersMiddleware } from './headers.middleware.js';
import { FortressRequestLoggingInterceptor } from './request-logger.interceptor.js';
import { FortressRequestIdMiddleware } from './request-id.middleware.js';
import { FORTRESS_PINO_LOGGER } from './request-logging.tokens.js';
import { RateLimitGuard } from './rate-limit.guard.js';
import { redisFactoryProvider } from './redis.provider.js';
import { FORTRESS_REDIS } from './redis.tokens.js';
import { SecurityChainTestController } from './security-chain.test-controller.js';
import { ZodValidationPipe } from './validation.pipe.js';

const securityChainControllers =
  process.env.NODE_ENV === 'production' ? [] : [SecurityChainTestController];

@Module({
  imports: [DiscoveryModule],
  controllers: [...securityChainControllers],
  providers: [
    BodyLimitRegistry,
    redisFactoryProvider,
    {
      provide: FORTRESS_PINO_LOGGER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        pino({
          level: config.get<string>('LOG_LEVEL') ?? 'info',
          redact: { paths: [...fortressPinoRedactPaths()], censor: '[redacted]' },
        }),
    },
    SecurityHeadersMiddleware,
    DynamicJsonBodyMiddleware,
    FortressRequestIdMiddleware,
    FortressRequestLoggingInterceptor,
    RateLimitGuard,
    { provide: APP_INTERCEPTOR, useClass: FortressRequestLoggingInterceptor },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_FILTER, useClass: FortressExceptionFilter },
  ],
  exports: [redisFactoryProvider, RateLimitGuard, FORTRESS_PINO_LOGGER],
})
export class SecurityModule implements NestModule, OnModuleDestroy {
  constructor(@Inject(FORTRESS_REDIS) private readonly redis: Redis) {}

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(FortressRequestIdMiddleware, SecurityHeadersMiddleware, DynamicJsonBodyMiddleware)
      .forRoutes('*');
  }

  onModuleDestroy(): void {
    void this.redis.quit();
  }
}
