import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { users } from '../../src/db/schema/users.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, '../../drizzle');

type UserRow = typeof users.$inferSelect;

describe('users table (integration)', () => {
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

  it('applies migrations, inserts a user, reads it back with expected columns/types', async (ctx) => {
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

    const clerkUserId = `test_clerk_${String(Date.now())}`;
    const inserted: UserRow[] = await db
      .insert(users)
      .values({ clerkUserId, email: 'user@example.test' })
      .returning();

    expect(inserted).toHaveLength(1);
    const row = inserted[0];
    expect(row).toBeDefined();
    if (!row) {
      return;
    }
    expect(row.clerkUserId).toBe(clerkUserId);
    expect(row.email).toBe('user@example.test');
    expect(row.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(row.createdAt).toBeInstanceOf(Date);
    expect(row.updatedAt).toBeInstanceOf(Date);
    expect(row.deletedAt).toBeNull();

    const fetchedRows: UserRow[] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));
    expect(fetchedRows).toHaveLength(1);
    const fetched = fetchedRows[0];
    expect(fetched).toBeDefined();
    if (!fetched) {
      return;
    }
    expect(fetched.id).toStrictEqual(row.id);
    expect(fetched.email).toBe('user@example.test');
  });
});
