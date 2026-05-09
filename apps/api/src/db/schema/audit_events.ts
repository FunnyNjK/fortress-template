import { desc, sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { sessions } from './sessions.js';
import { users } from './users.js';

export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    sessionId: uuid('session_id').references(() => sessions.id),
    action: text('action').notNull(),
    resource: text('resource'),
    metadata: jsonb('metadata').notNull().default(sql`'{}'::jsonb`),
    ipHash: text('ip_hash'),
    uaHash: text('ua_hash'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('audit_events_user_id_created_at_idx').on(
      table.userId,
      desc(table.createdAt),
    ),
  ],
);
