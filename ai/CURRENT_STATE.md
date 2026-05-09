# Current State

Last Updated: 2026-05-09

> **Target shape: ≤ 80 lines.** Snapshot only — implementation detail in DONE_LOG.md.

## Current Phase

**Phase 2** — **`P2-T7`** (**`origin/main`** **HEAD** **`git rev-parse`** **`after`** **`pull`**)**; **`CHAT_END`** payloads in **`DONE_LOG`** record planning chain **`67b7036`** (**code**) **`→`** **`c4c5ad5`** **`→`** **`d68e722`** **`→`** **`ee84249`** (**re-verify** **`workflow`** **`CI`** **`headSha`** **`==`** **`origin/main`** **`HEAD`**). **`phase-manifest`** **`Ready`** until **`REVIEW_PHASE_PROMPT`** **APPROVED**. **`Latest`** (**`during`** **`this`** **`CHAT_END`** **pass**) **`workflow`** **`CI`**: **`ee84249`** **`25610859927`** **`success`**; **`d68e722`** **`25610807641`**; **`c4c5ad5`** **`25610756184`** (**`DONE_LOG`**); **`67b7036`** **`25610665643`** (historical).

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

None (**human reviewer** **APPROVED** owed; **`CI`** (**`workflow`** **`name`** **`CI`**) **`success`** on **`origin/main`** (**`DONE_LOG`** + **`gh`**).

## Important Files or Folders

- **`turbo.json`**, **`.github/workflows/ci.yml`**
- **`apps/api/src/security/request-logger.interceptor.ts`**, **`request-id.middleware.ts`**, **`exception.filter.ts`**, **`rate-limit.guard.ts`**
- **`apps/api/vitest.config.ts`** (serial **`test/db/*`** migrants)
- **`apps/api/test/integration/rate-limit-unauth.integration.test.ts`**

## Next Recommended Action

1. **Human**: **`./ai/templates/REVIEW_PHASE_PROMPT.md`** → **APPROVED** (**`CI`** **`success`** on latest **`origin/main`** via **`gh run list`** (**`workflow`** **`CI`**, **`name`** **`CI`**)).
2. After gate: backlog **Phase 3** scaffold (**Partial** unattended matrix).

## Session reconciliation

**Planning tip **`ee84249`** (**`full`** **`ee84249e9203c5a937daefe80f071fc0fd0a9fa9`**) **`CI`** **`25610859927`** **`success`** (**`DONE_LOG`** **`CHAT_END`** entries cover **`c4`/`d68`/`ee`**).
