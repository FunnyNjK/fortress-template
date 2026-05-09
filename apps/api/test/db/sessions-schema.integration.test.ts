import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { sessions } from '../../src/db/schema/sessions.js';
import { users } from '../../src/db/schema/users.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, '../../drizzle');

type SessionRow = typeof sessions.$inferSelect;

describe('sessions table (integration)', () => {
  let pool: pg.Pool | undefined;
  let skipReason: string | undefined;

  beforeAll(async () => {
    const url = process.env.DATABASE_URL;
    if (!url?.trim()) {
      skipReason = 'DATABASE_URL is not set.';
      return;
    }
    const testPool = new pg.Pool({ connectionString: url });
    try {
      const connection = await testPool.connect();
      connection.release();
      pool = testPool;
    } catch (err) {
      await testPool.end().catch(() => {});
      const detail = err instanceof Error ? err.message : String(err);
      skipReason =
        `Postgres not reachable at DATABASE_URL (${detail}). ` +
        'Start Postgres (for example `docker compose up -d postgres` from the repo root) and align credentials.';
    }
  });

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  it('inserts a session with required columns and reads it back', async (ctx) => {
    if (skipReason) {
      ctx.skip(skipReason);
      return;
    }
    if (!pool) {
      ctx.skip('Database pool was not initialized.');
      return;
    }

    const db = drizzle(pool);
    await migrate(db, { migrationsFolder });

    const clerkUserId = `test_clerk_sess_${String(Date.now())}`;
    const [user] = await db
      .insert(users)
      .values({ clerkUserId, email: 'session-owner@example.test' })
      .returning({ id: users.id });
    if (!user?.id) {
      expect(user?.id).toBeDefined();
      return;
    }
    const userId = user.id;

    const lastSeen = new Date('2026-05-09T12:00:00.000Z');
    const steppedUp = new Date('2026-05-09T12:05:00.000Z');
    const hashedToken = `sess_hash_${String(Date.now())}`;

    const inserted: SessionRow[] = await db
      .insert(sessions)
      .values({
        userId,
        hashedSessionToken: hashedToken,
        lastSeenAt: lastSeen,
        hashedIp: 'ip_hash_fixture',
        hashedUa: 'ua_hash_fixture',
        steppedUpAt: steppedUp,
      })
      .returning();

    expect(inserted).toHaveLength(1);
    const row = inserted[0];
    expect(row).toBeDefined();
    if (!row) {
      return;
    }
    expect(row.userId).toStrictEqual(userId);
    expect(row.hashedSessionToken).toBe(hashedToken);
    expect(row.lastSeenAt).toStrictEqual(lastSeen);
    expect(row.hashedIp).toBe('ip_hash_fixture');
    expect(row.hashedUa).toBe('ua_hash_fixture');
    expect(row.steppedUpAt).toStrictEqual(steppedUp);
    expect(row.createdAt).toBeInstanceOf(Date);
    expect(row.updatedAt).toBeInstanceOf(Date);

    const fetched: SessionRow[] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.hashedSessionToken, hashedToken));
    expect(fetched).toHaveLength(1);
    expect(fetched[0]?.id).toStrictEqual(row.id);
  });

  it('rejects insert with orphan user_id FK', async (ctx) => {
    if (skipReason) {
      ctx.skip(skipReason);
      return;
    }
    if (!pool) {
      ctx.skip('Database pool was not initialized.');
      return;
    }

    const db = drizzle(pool);
    await migrate(db, { migrationsFolder });

    await expect(
      db.insert(sessions).values({
        userId: '00000000-0000-4000-8000-000000000002',
        hashedSessionToken: `orphan_token_${String(Date.now())}`,
        lastSeenAt: new Date(),
      }),
    ).rejects.toThrow();
  });
});
