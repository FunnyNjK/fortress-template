# AI Handoff

Last Updated: 2026-05-09

> **Target shape: ≤ 50 lines.** Baton, not a diary.

## Current State Summary

**`P2-T7`** landed as **`1dea680`** (await **`git push`**). Highlights: **`turbo`** **`lint`/`test`** **`dependsOn:^build`**; **`test` JOB `DATABASE_URL`** uses **`127.0.0.1`** (+ **`NODE_ENV=test`** CI); **`api-integration`** runs **`pnpm run build`** pre-suite; **`RateLimitGuard` before `AuthenticatedGuard`**; **`FortressRequestIdMiddleware` + **`FortressRequestLoggingInterceptor`** (429 via **`FortressExceptionFilter`** **pino**); **`__Host-` CSRF always `Secure`**; **`NODE_ENV` required** (**`main.ts`** prod JWKS guard); **`ADR-029`**; integration **`rate-limit-unauth`** (`test/integration/`); **`CHAT_END_PROMPT`** requires **`gh run list`**.

## Last Completed Task

**`P2-T7`** — **`1dea680`**. Prior **`origin/main`** tip **`72b07fb`** (**pre-remediation `HANDOFF`** overstated Phase 2 completeness vs **`TASKS`**).

## Active Task

None (**human reviewer + CI verdict** owns the phase boundary).

## Next Recommended Task

Human: **`./ai/templates/REVIEW_PHASE_PROMPT.md`** on **`origin/main`** post-push; **`gh run list --branch main --limit 1 --json status,conclusion,headSha`**. Phase 3 only after **`APPROVED`** (**`Partial`** Clerk harness rules).

## What Is Blocked

**Phase 2 NOT “Complete” in manifest sense** until reviewer **APPROVED** + **`conclusion.success`**.

## Important Instructions for Next AI

- **Commit message** cites **interceptor/logger + guards + **`ADR-029`****.
- **`pnpm`** locally: **`npx pnpm@10.33.4`** fallback.
- **Integration**: Compose Redis password → **`redis://:…@127.0.0.1:6379/0`** in CI (**`ALLOW_DEV_AUTH`**, **`NODE_ENV=test`**).

## Known Risks

- Redis RL tests patch **`Redis#ping`** in other suites — restore **`finally`**.
- **`/healthz`** burst still logs loudly (baseline behavior).

## Tests / Checks Last Run

CHAT_END (pre-push): **`npx pnpm@10.33.4`** **`lint`**, **`typecheck`**, **`test`**, **`build`**; **`pnpm --filter api test`**; **`pnpm --filter api test:integration`** (**local `.env`** + Postgres/Redis + migrate). **`pnpm audit --audit-level=high`** (**1 moderate**, below **`high`** gate). **`gh run list`** not evaluated until after **`git push`**.
