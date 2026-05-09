# Current State

Last Updated: 2026-05-09

> **Target shape: ≤ 80 lines.** Snapshot only — implementation detail in DONE_LOG.md.

## Current Phase

**Phase 2** — remediation task **P2-T7** landed in working tree (**`phase-manifest`** still **`Ready`** pending human **`REVIEW_PHASE_PROMPT` → APPROVED** + green **`origin/main`** per **`gh run list`**).

## Current Task

**None** (**review gate**). Next human step: reviewer prompt + CI confirmation (**do not declare Phase 2 Done prematurely**).

## What Exists Now

- Monorepo + packages through **Phase 1** (**unchanged**).
- **`apps/api`**: **`RateLimitGuard` → `AuthenticatedGuard` → `CsrfGuard`**; **`FortressRequestIdMiddleware`**; inbound journal **`FortressRequestLoggingInterceptor`**; **429** access line from **`FortressExceptionFilter`**; **`Secure` CSRF **`__Host-`**; **`NODE_ENV` required env schema** + **`main.ts`** production JWKS class assertion; **`ADR-029`**-documented RL fail-open **pino.warning** (**`evt`/`metric`**); health/auth/security integration suites updated.
- **CI / Turbo**: **`lint`/`test`** depend on **`^build`**; **`test` DATABASE_URL localhost** pattern; **`api-integration` build** prerequisite.
- **`CHAT_END_PROMPT`**: mandates **`gh run list`** verification before phase-complete claims.

## What Works

- **`pnpm`** **`lint`** / **`typecheck`** / **`test`** / **`build`** (turbo pipelines).
- **`pnpm --filter api test`** (**unit/smoke**) + **`pnpm --filter api test:integration`** (with Postgres/Redis/migrations).

## What Is Not Built Yet

**`apps/web`** and phases **≥ 3**.

## Known Problems

None code-side (**CI post-push verdict TBD**).

## Important Files or Folders

- **`turbo.json`**, **`.github/workflows/ci.yml`**
- **`apps/api/src/security/request-logger.interceptor.ts`**, **`request-id.middleware.ts`**, **`exception.filter.ts`**, **`rate-limit.guard.ts`**
- **`apps/api/test/integration/rate-limit-unauth.integration.test.ts`**

## Next Recommended Action

1. **Human / CI**: **`git push`**, **`gh run list`**, reviewer **`APPROVED`**.
2. After gate: backlog **Phase 3** scaffold (**Partial** unattended matrix).

## Session reconciliation

**P2-T7**: **`0eae43e`** on local **`main`** (push + **`gh run list`** verification still owed before calling Phase 2 done).
