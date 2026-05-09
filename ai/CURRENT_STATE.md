# Current State

Last Updated: 2026-05-09

> **Target shape: ≤ 80 lines.** Snapshot only — implementation detail in DONE_LOG.md.

## Current Phase

**Phase 2** — **`P2-T7`** on **`origin/main`**, tip **`c4c5ad5`** (**`1dea680`** → **`1f84951`** → **`eb64d1b`** → **`36d5c7e`** → **`67b7036`** (**code**) → **`c4c5ad5`** (**planning **`CHAT_END`**)). **`phase-manifest`** **`Ready`** until **`REVIEW_PHASE_PROMPT`** **APPROVED**. **`HEAD`** (**`c4c5ad5da09aa551f6a9ba794d9725fd3d1c05bd`**) **`CI`** (**`databaseId`** **`25610756184`**) **`success`** (**`DONE_LOG`** tail); code subtree **`67b7036`** had **`CI`** **`25610665643`** **`success`** previously).

## Current Task

**None** (**review gate**). Next human step: reviewer prompt + CI confirmation (**do not declare Phase 2 Done prematurely**).

## What Exists Now

- Monorepo + packages through **Phase 1** (**unchanged**).
- **`apps/api`**: **`RateLimitGuard` → `AuthenticatedGuard` → `CsrfGuard`**; **`FortressRequestIdMiddleware`**; inbound journal **`FortressRequestLoggingInterceptor`**; **429** access line from **`FortressExceptionFilter`**; **`Secure`** **`__Host-`** cookie (CSRF); **`NODE_ENV` required env schema** + **`main.ts`** production JWKS class assertion; **`ADR-029`**-documented RL fail-open **pino.warning** (**`evt`/`metric`**); health/auth/security integration suites updated.
- **CI / Turbo**: **`lint`/`test`** depend on **`^build`**; **`test` DATABASE_URL localhost** pattern; **`api-integration` build** prerequisite.
- **`CHAT_END_PROMPT`**: mandates **`gh run list`** verification before phase-complete claims.

## What Works

- **`pnpm`** **`lint`** / **`typecheck`** / **`test`** / **`build`** (turbo pipelines).
- **`pnpm --filter api test`** (**unit/smoke**) + **`pnpm --filter api test:integration`** (with Postgres/Redis/migrations).

## What Is Not Built Yet

**`apps/web`** and phases **≥ 3**.

## Known Problems

None (human reviewer **APPROVED** still owed; **`origin/main`** tip **`c4c5ad5`** — verify **`HEAD`** (**`c4c5ad5da09aa551f6a9ba794d9725fd3d1c05bd`**) **`CI`** in **`DONE_LOG`** + **`gh run list`** **`name`** **`CI`**).

## Important Files or Folders

- **`turbo.json`**, **`.github/workflows/ci.yml`**
- **`apps/api/src/security/request-logger.interceptor.ts`**, **`request-id.middleware.ts`**, **`exception.filter.ts`**, **`rate-limit.guard.ts`**
- **`apps/api/vitest.config.ts`** (serial **`test/db/*`** migrants)
- **`apps/api/test/integration/rate-limit-unauth.integration.test.ts`**

## Next Recommended Action

1. **Human**: **`./ai/templates/REVIEW_PHASE_PROMPT.md`** → **APPROVED** (**`CI`** **`success`** on **`c4c5ad5da09aa551f6a9ba794d9725fd3d1c05bd`** / **`c4c5ad5`** via **`gh run list`** **`name`** **`CI`**).
2. After gate: backlog **Phase 3** scaffold (**Partial** unattended matrix).

## Session reconciliation

**Planning tip** **`c4c5ad5`** (**`c4c5ad5da09aa551f6a9ba794d9725fd3d1c05bd`**) inherits **P2‑T7** subtree **`67b7036`**; **`HEAD`** **`workflow`** **`CI`** (**`25610756184`**) **`completed`** (**`success`**) (**`DONE_LOG`** tail).
