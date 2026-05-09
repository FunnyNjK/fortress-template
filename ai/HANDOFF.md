# AI Handoff

Last Updated: 2026-05-09

> **Target shape: ≤ 50 lines.** Baton, not a diary.

## Current State Summary

**`origin/main`** (**`CHAT_END_PROMPT`** planning **atop** **P2‑T7** **`67b7036`): **`HEAD`** (**`git rev-parse`** **`origin/main`** **`after`** **`pull`**)**; **`workflow`** **`CI`** (**match **`name`** **`CI`** in **`JSON`**) **`conclusion`** via **`gh run list --workflow CI --branch main --limit 3 --json`** ( **`DONE_LOG`** **`CHAT_END`** tail holds **`workflow`** **`CI`** **`JSON`** through **`ee27a77`**). **`P2‑T7`** subtree (**`67b7036`**) reference **`CI`** (**`25610665643`**) (**historical code gate** **`success`**). Highlights: **`turbo`** **`lint`/`test`** **`dependsOn:^build`**; **`DATABASE_URL`** **`127.0.0.1`** in **`test`** + **`NODE_ENV=test`** CI; **`api-integration`** **`pnpm build`** prelude; **`RateLimitGuard` before `AuthenticatedGuard`**; **`FortressRequestIdMiddleware`** + **`FortressRequestLoggingInterceptor`** + **429** **`FortressExceptionFilter`** **pino**; **`Secure`** **`__Host-`** **CSRF**; **`NODE_ENV` required** + **`main.ts`** JWKS prod guard; **`ADR-029`**; **`rate-limit-unauth.integration`**; **`CHAT_END_PROMPT`** **`gh`** rule.

## Last Completed Task

**`P2-T7`** (plus CI + CHAT ritual): **`1dea680`** · **`1f84951`** · **`eb64d1b`** · **`67b7036`** (**code**) · planning stack **`c4c5ad5`** → **`d68e722`** → **`ee84249`** → **`d9355f9`** → **`ee27a77`** (**detail** **`DONE_LOG`**).

## Active Task

Phase **reviewer gate**: **`./ai/templates/REVIEW_PHASE_PROMPT.md`** must return **APPROVED** (`phase-manifest` stays **`Ready`** until then).

## Next Recommended Task

Human reviewer on **`origin/main`** **`HEAD`** (**`git`** **`rev-parse`** **`origin/main`**) — **`gh run list --branch main --limit 3 --json`** (filter **`name`** **`CI`** for phase gates vs Dependabot noise). Phase 3 only after **`APPROVED`** + ADR-022 (**`Partial`** Clerk).

## What Is Blocked

Manifest **Phase 2 Complete**: still **blocked** pending **human APPROVED** (**latest **`origin/main`** **`HEAD`** (**`CI`** **`name`** **`CI`**) must be **`success`** per **`DONE_LOG`** + **`gh run list`** **`name`** **`CI`**).

## Important Instructions for Next AI

- **`pnpm`**: **`npx pnpm@10.33.4`** fallback.
- **Redis CI**: Compose password URL **`redis://:test@127.0.0.1:6379/0`** pattern.
- **`api`** unit **`Vitest`**: **`fileParallelism:false`** — do not re-enable parallel **`test/db/*`** migrants against shared Postgres.

## Known Risks

- **`/healthz`** load tests log volume (expected).
- Dependabot/other non-CI workflows may appear **`success`** beside **`72b07fb`** — filter **`name==CI`** when interpreting **`gh`** output.

## Tests / Checks Last Run

**Last **`CHAT_END`** **`gh`** **`watch`**: **`ee27a77`** (**`databaseId`** **`25611021858`**) (**`success`**)**; **`prior`** **`CHAT_END`** payloads (**`DONE_LOG`** **tail**). Locally: **`npx pnpm@10.33.4`** **`lint`** **`typecheck`** **`test`** **`build`**; **`pnpm --filter api test`**; **`pnpm --filter api test:integration`**; **`pnpm audit --audit-level=high`** (**1 moderate**, below **`high`** gate). This CHAT ritual: **`git fetch`**, **`gh`** (**`preflight`** **`run list`** **`+`** **`watch`** **`workflow`** **`CI`**) (**not full local suite unless CI regresses**).
