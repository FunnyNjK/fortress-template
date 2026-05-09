import type { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

import { FORTRESS_REDIS } from './redis.tokens.js';

export const redisFactoryProvider: FactoryProvider<Redis> = {
  provide: FORTRESS_REDIS,
  inject: [ConfigService],
  useFactory: (config: ConfigService): Redis => {
    const url = config.getOrThrow<string>('REDIS_URL');
    return new Redis(url, { maxRetriesPerRequest: 2, lazyConnect: true });
  },
};
