# AI Handoff

Last Updated: 2026-05-09

> **Target shape: ≤ 50 lines.** Baton, not a diary.

## Current State Summary

**`origin/main`** **`eb64d1b`**: **`P2-T7`** remediation (**`1dea680`**) + baton (**`1f84951`**) + **Vitest Postgres race** (**`eb64d1b`**). **`gh`** CI **`25610557287`** → **`success`**. Highlights: **`turbo`** **`lint`/`test`** **`dependsOn:^build`**; **`DATABASE_URL`** **`127.0.0.1`** in **`test`** + **`NODE_ENV=test`** CI; **`api-integration`** **`pnpm build`** prelude; **`RateLimitGuard` before `AuthenticatedGuard`**; **`FortressRequestIdMiddleware`** + **`FortressRequestLoggingInterceptor`** + **429** **`FortressExceptionFilter`** **pino**; **`Secure`** **`__Host-`** **CSRF**; **`NODE_ENV` required** + **`main.ts`** JWKS prod guard; **`ADR-029`**; **`rate-limit-unauth.integration`**; **`CHAT_END_PROMPT`** **`gh`** rule.

## Last Completed Task

**`P2-T7`** (plus CI follow-ups): implementation **`1dea680`**, planning SHA reconcile **`1f84951`**, **`Vitest`** serial DB tests **`eb64d1b`**.

## Active Task

Phase **reviewer gate**: **`./ai/templates/REVIEW_PHASE_PROMPT.md`** must return **APPROVED** (`phase-manifest` stays **`Ready`** until then).

## Next Recommended Task

Human reviewer on **`origin/main`** **`eb64d1b`**. **`gh run list --branch main --limit 3`** for history (latest green **CI** vs docs-only workflow noise). Phase 3 only after **`APPROVED`** + ADR-022 (**`Partial`** Clerk).

## What Is Blocked

Manifest **Phase 2 Complete**: still **blocked** pending **human APPROVED** (CI is green on **`eb64d1b`**).

## Important Instructions for Next AI

- **`pnpm`**: **`npx pnpm@10.33.4`** fallback.
- **Redis CI**: Compose password URL **`redis://:test@127.0.0.1:6379/0`** pattern.
- **`api`** unit **`Vitest`**: **`fileParallelism:false`** — do not re-enable parallel **`test/db/*`** migrants against shared Postgres.

## Known Risks

- **`/healthz`** load tests log volume (expected).
- Dependabot/other non-CI workflows may appear **`success`** beside **`72b07fb`** — filter **`name==CI`** when interpreting **`gh`** output.

## Tests / Checks Last Run

Latest **`CI`** (**`25610557287`**) on **`eb64d1b`**: **`conclusion`** **`success`** (**`main`**). Locally: **`npx pnpm@10.33.4`** **`lint`** **`typecheck`** **`test`** **`build`**; **`pnpm --filter api test`**; **`pnpm --filter api test:integration`**; **`pnpm audit --audit-level=high`** (**1 moderate**, below **`high`** gate).
