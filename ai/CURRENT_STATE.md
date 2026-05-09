# Current State

Last Updated: 2026-05-09

> **Target shape: ≤ 80 lines.** Snapshot only — implementation detail in DONE_LOG.md.

## Current Phase

**Phase 2 (API skeleton).** **`P2-T5`** complete. Next: **`P2-T6`**.

## Current Task

**`P2-T6`** — Health endpoints + Phase 2 verification harness. See **`/ai/TASKS.md`**.

## What Exists Now

- Root monorepo skeleton (unchanged from Phase 0): `pnpm-workspace.yaml`, Turbo, CI, `docker-compose`,
  `.env.example`, setup scripts — see prior entries.
- **`packages/types`** — branded boundary types, `FORTRESS_API_VERSION`, pagination input shape; zero runtime deps.
- **`packages/crypto`** — AES-256-GCM secret box, HMAC-SHA256, timing-safe compare, `randomOpaqueBytes`.
- **`packages/auth-core`** — CSRF double-submit compare, base64url opaque tokens, canonical cookie/header names.
- **`packages/observability`** — `createFortressLogger`, **`fortressPinoRedactPaths()`** export for nestjs-pino.
- **`packages/sdk`** — `createFortressSdk`, **`AuthMeResponseSchema`** (`id` + `clerkUserId`), `normalizeBaseUrl`; `engines.node` pinned.
- **`packages/testing`** — Vitest fixtures importing `@fortress/types`.
- **`apps/api`** — Nest + Drizzle + **P2-T4 security** + **P2-T5 auth**: **`AuthModule`**, dev JWKS stub, session/audit services, CSRF, **`GET /auth/me`**, global guard ordering; env **`FORTRESS_REQUEST_HMAC_KEY`**, **`ALLOW_DEV_AUTH`**.
- **`@types/node`** — root `devDependencies` for workspace `tsc` with `types: ["node"]`.

## What Works

- `pnpm --filter api` `build` / `lint` / `typecheck` / `test`; root Turbo includes `api`.
- `pnpm --filter api db:generate` (idempotent), `db:migrate` against reachable Postgres; smoke tests in packages.

## What Is Not Built Yet

- **`/healthz`** / **`/readyz`** and Phase 2 verification harness (**`P2-T6`**).

## Known Problems

None.

## Important Files or Folders

- `/apps/api` — Nest API + Drizzle.  
- `/apps/api/drizzle` — SQL migrations + meta.  
- `/apps/api/src/security` — inbound boundary middleware and guards.  
- `/apps/api/src/auth` — session, audit, CSRF, JWKS stub.  
- `/ai/HANDOFF.md` — next-session baton  
- `/packages/sdk` — web↔API typed boundary  
- `/packages/crypto`, `/packages/auth-core` — security helpers for API  

## Next Recommended Action

1. Confirm **GitHub Actions CI is green** on `origin/main` after push.
2. Implement **`P2-T6`** per **`/ai/TASKS.md`**.
3. When passing `<N>` to **`./run-phase-cursor.sh`**, pass exactly the Phase 2 task count — do not cross a phase boundary unattended (ADR-022).

## Session reconciliation

2026-05-09 — **P2-T5**: auth + session/audit + CSRF + SDK **`AuthMeResponse`**; CI env keys; **`pnpm-lock.yaml`** updated.

CHAT_END (2026-05-09): **`CHAT_END_PROMPT.md`** verification on **`d21487a`**: Turbo **`lint`** / **`typecheck`** / **`test`** / **`build`**; **`pnpm audit --audit-level=high`** (1 moderate); **`.env.example`** **`replace-with`** count **28**.
