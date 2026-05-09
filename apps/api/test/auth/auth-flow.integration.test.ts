import 'reflect-metadata';

import type { Server } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FORTRESS_CSRF_HEADER_NAME } from '@fortress/auth-core';
import { Redis } from 'ioredis';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { FORTRESS_CSRF_COOKIE_NAME } from '../../src/auth/auth.constants.js';
import { AppModule } from '../../src/app.module.js';
import { auditEvents } from '../../src/db/schema/audit_events.js';
import { sessions } from '../../src/db/schema/sessions.js';
import { users } from '../../src/db/schema/users.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, '../../drizzle');

interface AuthMeBody {
  id: string;
  clerkUserId: string;
}

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

function parseSetCookieCsrf(setCookie: string[] | undefined): string | undefined {
  if (!setCookie) {
    return undefined;
  }
  const line = setCookie.find((c) => c.startsWith(`${FORTRESS_CSRF_COOKIE_NAME}=`));
  if (!line) {
    return undefined;
  }
  const part = line.split(';')[0] ?? '';
  const eqIdx = part.indexOf('=');
  if (eqIdx === -1) {
    return undefined;
  }
  return decodeURIComponent(part.slice(eqIdx + 1));
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

describe.skipIf(!pool || !!skipReason || (!redisOk && process.env.CI !== 'true'))(
  'auth session + /auth/me + CSRF (integration)',
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

    beforeEach(async () => {
      if (!pool) {
        return;
      }
      const db = drizzle(pool);
      await db.delete(auditEvents);
      await db.delete(sessions);
      await db.delete(users);
    });

    it('returns 401 for guarded /auth/me without x-debug-user-id', async () => {
      const server = requireApp().getHttpServer() as Server;
      await request(server)
        .get('/auth/me')
        .set('Authorization', 'Bearer unit-test-token')
        .expect(401);
    });

    it('creates user, session, and audit once; second request reuses session', async () => {
      if (!pool) {
        return;
      }
      const server = requireApp().getHttpServer() as Server;
      const db = drizzle(pool);

      const auth = { Authorization: 'Bearer integration-mw-token', 'x-debug-user-id': 'u1' };

      const r1 = await request(server).get('/auth/me').set(auth).expect(200);
      expect(r1.body).toMatchObject({ clerkUserId: 'u1' });
      const b1 = r1.body as AuthMeBody;
      expect(typeof b1.id).toBe('string');

      const r2 = await request(server).get('/auth/me').set(auth).expect(200);
      const b2 = r2.body as AuthMeBody;
      expect(b2.id).toBe(b1.id);

      const sessRows = await db.select().from(sessions);
      expect(sessRows).toHaveLength(1);

      const auditRows = await db
        .select()
        .from(auditEvents)
        .where(eq(auditEvents.action, 'auth.session.created'));
      expect(auditRows).toHaveLength(1);
    });

    it('parallel /auth/me with same bearer yields one session row', async () => {
      if (!pool) {
        return;
      }
      const server = requireApp().getHttpServer() as Server;
      const db = drizzle(pool);

      const auth = { Authorization: 'Bearer burst-token', 'x-debug-user-id': 'burst-user' };
      await Promise.all([
        request(server).get('/auth/me').set(auth).expect(200),
        request(server).get('/auth/me').set(auth).expect(200),
      ]);

      const sessRows = await db.select().from(sessions);
      expect(sessRows).toHaveLength(1);
    });

    it('POST /auth/poke returns 403 without CSRF double-submit', async () => {
      const server = requireApp().getHttpServer() as Server;
      const auth = { Authorization: 'Bearer csrf-test', 'x-debug-user-id': 'csrf-u' };

      await request(server).get('/auth/me').set(auth).expect(200);

      await request(server)
        .post('/auth/poke')
        .set('Authorization', auth.Authorization)
        .set('x-debug-user-id', auth['x-debug-user-id'])
        .expect(403);
    });

    it('POST /auth/poke succeeds with CSRF cookie and header', async () => {
      const server = requireApp().getHttpServer() as Server;
      const auth = { Authorization: 'Bearer csrf-ok', 'x-debug-user-id': 'csrf-ok-u' };

      const getRes = await request(server).get('/auth/me').set(auth).expect(200);
      const token = parseSetCookieCsrf(
        getRes.headers['set-cookie'] as string[] | undefined,
      );
      expect(token).toBeDefined();
      if (!token) {
        return;
      }

      const cookieHeader = `${FORTRESS_CSRF_COOKIE_NAME}=${encodeURIComponent(token)}`;
      await request(server)
        .post('/auth/poke')
        .set('Authorization', auth.Authorization)
        .set('x-debug-user-id', auth['x-debug-user-id'])
        .set('Cookie', cookieHeader)
        .set(FORTRESS_CSRF_HEADER_NAME, token)
        .expect(204);
    });
  },
);
