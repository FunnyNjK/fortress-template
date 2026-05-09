import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { auditEvents } from '../../src/db/schema/audit_events.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, '../../drizzle');

describe('audit_events append-only trigger (integration)', () => {
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

  it('rejects UPDATE and DELETE on audit_events (append-only trigger)', async (ctx) => {
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

    const inserted = await db
      .insert(auditEvents)
      .values({ action: 'test.append_only' })
      .returning({ id: auditEvents.id });
    expect(inserted).toHaveLength(1);
    const id = inserted[0]?.id;
    expect(id).toBeDefined();
    if (!id) {
      return;
    }

    await expect(
      pool.query('UPDATE audit_events SET action = $1 WHERE id = $2', [
        'mutated',
        id,
      ]),
    ).rejects.toThrow(/append-only/);

    await expect(
      pool.query('DELETE FROM audit_events WHERE id = $1', [id]),
    ).rejects.toThrow(/append-only/);

    const remaining = await db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.id, id));
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.action).toBe('test.append_only');
  });

  it('rejects audit_events row with orphan user_id FK', async (ctx) => {
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
      db.insert(auditEvents).values({
        userId: '00000000-0000-4000-8000-000000000001',
        action: 'test.orphan_user',
      }),
    ).rejects.toThrow();
  });
});
