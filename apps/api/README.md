# Fortress API (`apps/api`)

This NestJS app is the **sole owner** of database access for the Fortress template: Drizzle persists to Postgres; Redis backs rate limiting, session caches, and readiness checks (`GET /readyz`). The Next.js web app must call this API via `@fortress/sdk`, not the database directly.

**Run locally:** from the repo root, start Postgres and Redis (`docker compose up -d postgres redis` with `.env` from `scripts/setup.sh`), export `DATABASE_URL` and `REDIS_URL`, then `pnpm --filter api dev`. Fast tests: `pnpm --filter api test`. Full Phase 2 integration (security chain, auth, readiness) requires reachable services plus applied migrations — `pnpm --filter api db:migrate` — then `pnpm --filter api test:integration`.

CSRF (`__Host-fortress-csrf`): the cookie **always includes `Secure`**. Plain `http://` dev origins will often not persist that cookie — use **`https://` locally** (for example mkcert) for browser flows that rely on CSRF, or integrate against the cookie via clients that replay the literal `Set-Cookie` header (as supertest integration tests do).
