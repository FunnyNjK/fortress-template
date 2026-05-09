import 'reflect-metadata';

import type { Server } from 'node:http';

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Redis } from 'ioredis';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { AppModule } from '../../src/app.module.js';

async function redisReachable(url: string): Promise<boolean> {
  const r = new Redis(url, {
    maxRetriesPerRequest: 0,
    connectTimeout: 2000,
    lazyConnect: true,
  });
  try {
    await r.connect();
    await r.ping();
    await r.quit();
    return true;
  } catch {
    await r.quit().catch(() => {});
    return false;
  }
}

const redisUrl = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379/0';
const redisOk = await redisReachable(redisUrl);
if (process.env.CI === 'true' && !redisOk) {
  throw new Error('Redis must be reachable when CI=true (see `.github/workflows/ci.yml`).');
}

describe.skipIf(!redisOk && process.env.CI !== 'true')(
  'rate limit vs unauthenticated protected routes (integration)',
  () => {
    let app: INestApplication | undefined;
    let redisAdmin: Redis | undefined;

    function requireApp(): INestApplication {
      if (!app) {
        throw new Error('Nest application not initialized');
      }
      return app;
    }

    beforeAll(async () => {
      redisAdmin = new Redis(redisUrl);
      const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
      app = moduleRef.createNestApplication({
        bufferLogs: true,
        bodyParser: false,
        logger: false,
      });
      await app.init();
    });

    afterAll(async () => {
      if (app) {
        await app.close();
      }
      if (redisAdmin) {
        await redisAdmin.quit();
      }
    });

    beforeEach(async () => {
      if (redisAdmin) {
        const keys = await redisAdmin.keys('fortress:rl:*');
        if (keys.length > 0) {
          await redisAdmin.del(...keys);
        }
      }
    });

    it(
      'returns 429 on the 121st /auth/me attempt with no Authorization header (rate limit before auth)',
      async () => {
        const server = requireApp().getHttpServer() as Server;
        for (let i = 0; i < 120; i++) {
          await request(server).get('/auth/me').expect(401);
        }
        const res = await request(server).get('/auth/me').expect(429);
        expect(res.headers['retry-after']).toBeDefined();
        expect(res.body).toMatchObject({ code: 'RATE_LIMITED' });
      },
      120_000,
    );
  },
);
