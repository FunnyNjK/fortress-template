import { Inject, Injectable } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { sql } from 'drizzle-orm';

import type { DrizzleDb } from '../db/drizzle.tokens.js';
import { DRIZZLE } from '../db/drizzle.tokens.js';
import { FORTRESS_REDIS } from '../security/redis.tokens.js';

export type ReadinessChecks = {
  postgres: { ok: boolean };
  redis: { ok: boolean };
};

@Injectable()
export class HealthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    @Inject(FORTRESS_REDIS) private readonly redis: Redis,
  ) {}

  async readinessChecks(): Promise<ReadinessChecks> {
    let postgresOk = false;
    try {
      await this.db.execute(sql`SELECT 1`);
      postgresOk = true;
    } catch {
      postgresOk = false;
    }

    let redisOk = false;
    try {
      await this.redis.ping();
      redisOk = true;
    } catch {
      redisOk = false;
    }

    return {
      postgres: { ok: postgresOk },
      redis: { ok: redisOk },
    };
  }
}
