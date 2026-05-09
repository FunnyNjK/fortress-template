# AI Handoff

Last Updated: 2026-05-10

> **Target shape: ≤ 50 lines.** Baton, not a diary.

## Current State Summary

**Phase 2 in progress.** **`P2-T4` complete**: **`SecurityModule`** (`apps/api/src/security/`) — Helmet headers + **`Permissions-Policy`**, **`DynamicJsonBodyMiddleware`** (256KB default, **`@AllowLargeBody`**) keyed on **`req.originalUrl`**, **`RateLimitGuard`** + **`ioredis`** (120/60s general, 20/60s **`@AuthRoute()`**, IP + **`x-fortress-session-id`** buckets), **`ZodValidationPipe`**, **`FortressRequestLoggerMiddleware`**, **`FortressExceptionFilter`**. **`REDIS_URL`** validated in **`env.schema`**; CI **`redis`** service; **`main.ts`** **`bodyParser: false`**.

## Last Completed Task

**P2-T4** — see `DONE_LOG.md` (commit hash in that entry after push).

## Active Task

**`P2-T5`** — Session/audit + JWKS stub + CSRF (`Unattended: Yes`).

## Next Recommended Task

Implement **`P2-T5`** per `/ai/TASKS.md`; reuse **`FORTRESS_REDIS`**; extend rate limit keying once **`sessionId`** exists on the request.

## What Is Blocked

None.

## Important Instructions for Next AI

- Confirm **CI green on `origin/main`** after pushes (GitHub Actions).
- Phase 2 **`P2-T5`–`P2-T6`** remain **`Unattended: Yes`** (matrix in `/ai/TASKS.md`).
- Security integration tests **skip** when Redis is unreachable **unless** `CI=true` — local dev: `docker compose up -d redis` or set **`REDIS_URL`** in **`.env`** (also loaded from **`apps/api/test/setup-env.ts`** for Vitest).
- **`pnpm`** may require `corepack prepare pnpm@10.33.4 --activate` or **`npx pnpm@10.33.4 <cmd>`** when `pnpm` is not on `PATH`.
- Pull-rebase before planning-file edits; deltas only (`/ai/templates/CHAT_END_PROMPT.md`).

## Known Risks

- Fixed-window rate limits are an approximation of a token bucket (see **ADR-028**).

## Tests / Checks Last Run

- 2026-05-10: `pnpm lint` / `typecheck` / `test` / `build` (workspace).
