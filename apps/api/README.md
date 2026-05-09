# Fortress API (`apps/api`)

This NestJS app is the **sole owner** of database access for the Fortress template: Drizzle persists to Postgres; Redis backs rate limiting, session caches, and readiness checks (`GET /readyz`). The Next.js web app must call this API via `@fortress/sdk`, not the database directly.

**Run locally:** from the repo root, start Postgres and Redis (`docker compose up -d postgres redis` with `.env` from `scripts/setup.sh`), export `DATABASE_URL` and `REDIS_URL`, then `pnpm --filter api dev`. Fast tests: `pnpm --filter api test`. Full Phase 2 integration (security chain, auth, readiness) requires reachable services plus applied migrations — `pnpm --filter api db:migrate` — then `pnpm --filter api test:integration`.
