# Current State

Last Updated: 2026-05-09

> **Target shape: ≤ 80 lines.** Snapshot only — implementation detail in DONE_LOG.md.

## Current Phase

**Phase 2 (API skeleton).** **P2-T2** complete: Drizzle + Postgres **`users`** table, **`DbModule`** + **`DATABASE_URL`** env validation, `db:*` scripts, CI Postgres service for **`api`** integration test. Next: **`P2-T3`–`P2-T6`**.

## Current Task

**`P2-T3`** — Drizzle **`audit_events`** + **`sessions`**. See `/ai/TASKS.md`.

## What Exists Now

- Root monorepo skeleton (unchanged from Phase 0): `pnpm-workspace.yaml`, Turbo, CI, `docker-compose`,
  `.env.example`, setup scripts — see prior entries.
- **`packages/types`** — branded boundary types, `FORTRESS_API_VERSION`, pagination input shape; zero runtime deps.
- **`packages/crypto`** — AES-256-GCM secret box, HMAC-SHA256, timing-safe compare, `randomOpaqueBytes`.
- **`packages/auth-core`** — CSRF double-submit compare, base64url opaque tokens, canonical cookie/header names.
- **`packages/observability`** — `createFortressLogger`, **`fortressPinoRedactPaths()`** export for nestjs-pino.
- **`packages/sdk`** — `createFortressSdk`, `AuthMeResponseSchema` (Zod strict), `normalizeBaseUrl`; `engines.node` pinned.
- **`packages/testing`** — Vitest fixtures importing `@fortress/types`.
- **`apps/api`** — Nest shell + **Drizzle** (`P2-T2`): **`DbModule`**, **`users`** schema, committed migration under **`drizzle/`**, Vitest DB integration + CI Postgres.
- **`@types/node`** — root `devDependencies` for workspace `tsc` with `types: ["node"]`.

## What Works

- `pnpm --filter api` `build` / `lint` / `typecheck` / `test`; root Turbo includes `api`.
- `pnpm --filter api db:generate` (idempotent), `db:migrate` against reachable Postgres; smoke tests in packages.

## What Is Not Built Yet

- `audit_events` / `sessions` schemas (**`P2-T3`**), security middleware, auth, health endpoints (`P2-T4`+).

## Known Problems

None.

## Important Files or Folders

- `/apps/api` — Nest API + Drizzle.  
- `/apps/api/drizzle` — SQL migrations + meta.  
- `/ai/HANDOFF.md` — next-session baton  
- `/packages/sdk` — web↔API typed boundary  
- `/packages/crypto`, `/packages/auth-core` — security helpers for API (when built)

## Next Recommended Action

1. Confirm **GitHub Actions CI is green** after the P2-T2 push (manual check on GitHub).
2. Implement **`P2-T3`** per `/ai/TASKS.md`.
3. When passing `<N>` to `./run-phase-cursor.sh`, pass exactly the Phase 2 task count — do not cross a phase boundary unattended (ADR-022).

## Session reconciliation

2026-05-09 — **P2-T1**: workspace `pnpm lint` / `typecheck` / `test` / `build` + `audit --audit-level=high` (clean). Older CHAT_END entries remain in `DONE_LOG.md`.

CHAT_END (2026-05-09): `git fetch` vs `origin/main` at `1bedc16` (clean); YAML `ci.yml` / `dependabot.yml`; `npx pnpm@10.33.4` `lint` / `typecheck` / `test` / `build`; `audit --audit-level=high`; `bash -n scripts/setup.sh`; `grep -c replace-with-` `.env.example` (=27); ARCHITECTURE / ROADMAP / TESTING / DEPLOYMENT / DECISIONS unchanged.
