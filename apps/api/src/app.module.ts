import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { fortressPinoRedactPaths } from '@fortress/observability';

import { EnvConfigModule } from './config/config.module.js';
import { DbModule } from './db/db.module.js';

@Module({
  imports: [
    EnvConfigModule,
    DbModule,
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
})
export class AppModule {}
