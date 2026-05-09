# AI Handoff

Last Updated: 2026-05-09

> **Target shape: ≤ 50 lines.** Baton, not a diary.

## Current State Summary

**Phase 2 in progress.** **`P2-T5` complete**: **`AuthModule`** — **`JwksVerifier`** + **`DevJwksStubVerifier`** (throws if constructed in production; **`x-debug-user-id`** + **`ALLOW_DEV_AUTH`**), **`UnsupportedProductionJwksVerifier`**, **`SessionService`** (HMAC hashed bearer/IP/UA, advisory-lock **`upsert`**, audit in-tx, Redis **`stepped_up_at`** cache), **`AuditService`**, global **`AuthenticatedGuard`** (`@Public` / **`@RequireAuth()`**), **`CsrfGuard`** + **`FortressCsrfCookieInterceptor`** (`__Host-fortress-csrf`, **`@fortress/auth-core`** double-submit), **`GET /auth/me`** + **`POST /auth/poke`**. **`AppModule`**: guard order Auth → rate limit → CSRF; **`FORTRESS_REQUEST_HMAC_KEY`** + **`ALLOW_DEV_AUTH`** in **`env.schema`** / **`.env.example`** / CI / **`test/setup-env`**. Rate limit uses **`req.fortressAuth?.sessionId`**. **`@fortress/sdk`**: **`AuthMeResponse`** = `{ id, clerkUserId }`.

## Last Completed Task

**P2-T5** — see `DONE_LOG.md` (commit hash in that entry after push).

## Active Task

**`P2-T6`** — Health endpoints + Phase 2 verification harness (`Unattended: Yes`).

## Next Recommended Task

Implement **`P2-T6`** per **`/ai/TASKS.md`** (`/healthz`, `/readyz`, integration harness).

## What Is Blocked

None.

## Important Instructions for Next AI

- Confirm **CI green on `origin/main`** after pushes (GitHub Actions).
- Phase 2 **`P2-T6`** remains **`Unattended: Yes`** (matrix in **`/ai/TASKS.md`**).
- Security integration tests **skip** when Redis is unreachable **unless** `CI=true` — local dev: `docker compose up -d redis` or set **`REDIS_URL`** in **`.env`**; auth integration also needs Postgres for full run.
- **`pnpm`** may require `corepack prepare pnpm@10.33.4 --activate` or **`npx pnpm@10.33.4 <cmd>`** when `pnpm` is not on `PATH`.
- Pull-rebase before planning-file edits; deltas only (`/ai/templates/CHAT_END_PROMPT.md`).

## Known Risks

- Fixed-window rate limits are an approximation of a token bucket (see **ADR-028**).

## Tests / Checks Last Run

- CHAT_END (2026-05-09): **`npx pnpm@10.33.4`** root **`lint`**, **`typecheck`**, **`test`**, **`build`**; **`pnpm audit --audit-level=high`** (**1 moderate**); **`git`** **`d21487a`** vs **`origin/main`** (clean).
