import 'reflect-metadata';

import type { Server } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Redis } from 'ioredis';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { AppModule } from '../../src/app.module.js';
import { DRIZZLE, type DrizzleDb } from '../../src/db/drizzle.tokens.js';
import { FORTRESS_REDIS } from '../../src/security/redis.tokens.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, '../../drizzle');

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
  throw new Error('Redis must be reachable when CI=true');
}

let pool: pg.Pool | undefined;
let skipReason: string | undefined;

beforeAll(async () => {
  const url = process.env.DATABASE_URL;
  if (!url?.trim()) {
    skipReason = 'DATABASE_URL is not set';
    return;
  }
  const testPool = new pg.Pool({ connectionString: url });
  try {
    const c = await testPool.connect();
    c.release();
    pool = testPool;
  } catch (err) {
    await testPool.end().catch(() => {});
    skipReason = err instanceof Error ? err.message : String(err);
  }
});

afterAll(async () => {
  if (pool) {
    await pool.end();
  }
});

/**
 * Postgres/Redis readiness uses real clients. Failures simulate infra outage by
 * temporarily stubbing driver methods (rather than stopping shared compose
 * services, which would break parallel suites and lacks Docker in minimal dev setups).
 */
describe.skipIf(!pool || !!skipReason || (!redisOk && process.env.CI !== 'true'))(
  'GET /readyz readiness',
  () => {
    let app: INestApplication | undefined;

    function requireApp(): INestApplication {
      if (!app) {
        throw new Error('Nest application not initialized');
      }
      return app;
    }

    beforeAll(async () => {
      if (!pool) {
        return;
      }
      const db = drizzle(pool);
      await migrate(db, { migrationsFolder });

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
    });

    it('returns 200 when Postgres and Redis are healthy', async () => {
      const server = requireApp().getHttpServer() as Server;
      const res = await request(server).get('/readyz').expect(200);
      expect(res.body).toEqual({
        status: 'ready',
        checks: { postgres: { ok: true }, redis: { ok: true } },
      });
    });

    it('returns 503 when Postgres check fails', async () => {
      const nest = requireApp();
      const server = nest.getHttpServer() as Server;
      const db = nest.get<DrizzleDb>(DRIZZLE);
      const spy = vi
        .spyOn(db, 'execute')
        .mockRejectedValue(new Error('simulated pg failure'));
      try {
        const res = await request(server).get('/readyz').expect(503);
        expect(res.body).toEqual({
          status: 'unavailable',
          checks: { postgres: { ok: false }, redis: { ok: true } },
        });
      } finally {
        spy.mockRestore();
      }
    });

    it('returns 503 when Redis ping fails', async () => {
      const nest = requireApp();
      const server = nest.getHttpServer() as Server;
      const redisClient = nest.get<Redis>(FORTRESS_REDIS);
      const original = redisClient.ping.bind(redisClient);
      redisClient.ping = (() => {
        return Promise.reject(new Error('simulated redis failure'));
      }) as typeof redisClient.ping;
      try {
        const res = await request(server).get('/readyz').expect(503);
        expect(res.body).toEqual({
          status: 'unavailable',
          checks: { postgres: { ok: true }, redis: { ok: false } },
        });
      } finally {
        redisClient.ping = original;
      }
    });

    it('GET /healthz stays 200 when Redis ping is broken', async () => {
      const nest = requireApp();
      const server = nest.getHttpServer() as Server;
      const redisClient = nest.get<Redis>(FORTRESS_REDIS);
      const original = redisClient.ping.bind(redisClient);
      redisClient.ping = (() => {
        return Promise.reject(new Error('simulated redis failure'));
      }) as typeof redisClient.ping;
      try {
        const res = await request(server).get('/healthz').expect(200);
        expect(res.body).toMatchObject({ status: 'ok' });
      } finally {
        redisClient.ping = original;
      }
    });
  },
);
