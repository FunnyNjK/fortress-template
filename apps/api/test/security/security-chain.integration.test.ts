import 'reflect-metadata';

import type { Server } from 'node:http';

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { fortressPinoRedactPaths } from '@fortress/observability';
import { Redis } from 'ioredis';
import pino from 'pino';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { AppModule } from '../../src/app.module.js';
import { BodyLimitRegistry } from '../../src/security/body-limit.registry.js';
import { FORTRESS_PINO_LOGGER } from '../../src/security/request-logger.middleware.js';

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
  throw new Error('Redis must be reachable when CI=true (see `.github/workflows/ci.yml` services).');
}

const prefix = '/__security_chain__';

describe.skipIf(!redisOk && process.env.CI !== 'true')(
  'security middleware chain (integration)',
  () => {
    let app: INestApplication | undefined;
    let redisAdmin: Redis | undefined;
    const capturedLogs: string[] = [];

    function requireApp(): INestApplication {
      if (!app) {
        throw new Error('Nest application not initialized');
      }
      return app;
    }

    beforeAll(async () => {
      redisAdmin = new Redis(redisUrl);

      const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
        .overrideProvider(FORTRESS_PINO_LOGGER)
        .useFactory({
          factory: () =>
            pino(
              {
                level: 'info',
                redact: { paths: [...fortressPinoRedactPaths()], censor: '[redacted]' },
              },
              {
                write(chunk: string): void {
                  capturedLogs.push(chunk);
                },
              },
            ),
          inject: [],
        })
        .compile();

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
      capturedLogs.length = 0;
      if (redisAdmin) {
        const keys = await redisAdmin.keys('fortress:rl:*');
        if (keys.length > 0) {
          await redisAdmin.del(...keys);
        }
      }
    });

    it('sets required security headers', async () => {
      const server = requireApp().getHttpServer() as Server;
      const res = await request(server).get(`${prefix}/rate-general`).expect(200);
      expect(res.headers['strict-transport-security']).toMatch(/max-age=/);
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(res.headers['permissions-policy']).toBeDefined();
      expect(res.headers['cross-origin-opener-policy']).toBe('same-origin');
      expect(res.headers['cross-origin-embedder-policy']).toBe('require-corp');
    });

    it(
      'returns 429 with Retry-After on the 121st general request in the window',
      async () => {
        const server = requireApp().getHttpServer() as Server;
        for (let i = 0; i < 120; i++) {
          await request(server).get(`${prefix}/rate-general`).expect(200);
        }
        const res = await request(server).get(`${prefix}/rate-general`).expect(429);
        expect(res.headers['retry-after']).toBeDefined();
        expect(Number(res.headers['retry-after'])).toBeGreaterThan(0);
        expect(res.body).toMatchObject({ code: 'RATE_LIMITED' });
      },
      120_000,
    );

    it(
      'returns 429 on the 21st @AuthRoute request in the window',
      async () => {
        const server = requireApp().getHttpServer() as Server;
        for (let i = 0; i < 20; i++) {
          await request(server).get(`${prefix}/rate-auth`).expect(200);
        }
        const res = await request(server).get(`${prefix}/rate-auth`).expect(429);
        expect(res.headers['retry-after']).toBeDefined();
        expect(res.body).toMatchObject({ code: 'RATE_LIMITED' });
      },
      30_000,
    );

    it('returns 413 when JSON body exceeds 256KB on default routes', async () => {
      const server = requireApp().getHttpServer() as Server;
      const message = 'x'.repeat(280_000);
      await request(server)
        .post(`${prefix}/echo`)
        .send({ message })
        .set('Content-Type', 'application/json')
        .expect(413);
    });

    it('registry applies AllowLargeBody to /large', () => {
      const reg = requireApp().get(BodyLimitRegistry);
      expect(reg.getLimitFor('POST', '/__security_chain__/large')).toBe(512_000);
    });

    it('allows >256KB body on @AllowLargeBody routes', async () => {
      const server = requireApp().getHttpServer() as Server;
      const message = 'y'.repeat(280_000);
      await request(server)
        .post(`${prefix}/large`)
        .send({ message })
        .set('Content-Type', 'application/json')
        .expect(200);
    });

    it('returns 400 for malformed JSON with generic body', async () => {
      const server = requireApp().getHttpServer() as Server;
      const res = await request(server)
        .post(`${prefix}/echo`)
        .set('Content-Type', 'application/json')
        .send('{ not-json')
        .expect(400);
      expect(res.body).toEqual({ code: 'BAD_REQUEST', message: 'Invalid request' });
      expect(JSON.stringify(res.body)).not.toMatch(/not-json/);
    });

    it('returns 400 for Zod validation failure without echoing input', async () => {
      const server = requireApp().getHttpServer() as Server;
      const res = await request(server)
        .post(`${prefix}/echo`)
        .send({ message: 12345 })
        .set('Content-Type', 'application/json')
        .expect(400);
      expect(res.body).toEqual({ code: 'BAD_REQUEST', message: 'Invalid request' });
    });

    it('returns 500 for unexpected errors without stack in the response body', async () => {
      const server = requireApp().getHttpServer() as Server;
      const res = await request(server).get(`${prefix}/boom`).expect(500);
      expect(res.body).toMatchObject({ code: 'INTERNAL_ERROR', message: 'An error occurred' });
      expect(res.body).not.toHaveProperty('stack');
      expect(JSON.stringify(res.body)).not.toMatch(/boom/);
    });

    it('does not write Authorization secrets into Pino log output for the request logger', async () => {
      const server = requireApp().getHttpServer() as Server;
      const secret = 'unit-test-secret-token-do-not-log';
      await request(server)
        .get(`${prefix}/rate-general`)
        .set('Authorization', `Bearer ${secret}`)
        .expect(200);
      const blob = capturedLogs.join('\n');
      expect(blob).not.toContain(secret);
      expect(blob).not.toContain('Authorization');
    });
  },
);
