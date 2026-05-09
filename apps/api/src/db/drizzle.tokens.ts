import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type * as schema from './schema/index.js';

/** Nest DI token for application-wide Drizzle Postgres client (`drizzle-orm/node-postgres`). */
export const DRIZZLE = Symbol('FORTRESS_DRIZZLE');

export type DrizzleDb = NodePgDatabase<typeof schema>;

export const PG_POOL = Symbol('FORTRESS_PG_POOL');
