import { sql } from 'drizzle-orm';
import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { users } from './users.js';

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    hashedSessionToken: text('hashed_session_token').notNull().unique(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull(),
    hashedIp: text('hashed_ip'),
    hashedUa: text('hashed_ua'),
    steppedUpAt: timestamp('stepped_up_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_user_id_stepped_up_idx')
      .on(table.userId)
      .where(sql`${table.steppedUpAt} is not null`),
  ],
);
