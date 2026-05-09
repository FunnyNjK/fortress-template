# Current State

Last Updated: 2026-05-09

> **Target shape: ≤ 80 lines.** Snapshot only — implementation detail in DONE_LOG.md.

## Current Phase

**Phase 2 (API skeleton) — started.** **`P2-T1` complete**: `apps/api` NestJS 11 scaffold (env validation
via Zod + `replace-with-*` rejection under `NODE_ENV=production`), `nestjs-pino` wired with paths from
**`fortressPinoRedactPaths()`** in `@fortress/observability`. Remaining Phase 2: `P2-T2`–`P2-T6`
(see `/ai/TASKS.md`).

## Current Task

**`P2-T2`** — Drizzle + Postgres (`users`). See `/ai/TASKS.md`.

## What Exists Now

- Root monorepo skeleton (unchanged from Phase 0): `pnpm-workspace.yaml`, Turbo, CI, `docker-compose`,
  `.env.example`, setup scripts — see prior entries.
- **`packages/types`** — branded boundary types, `FORTRESS_API_VERSION`, pagination input shape; zero runtime deps.
- **`packages/crypto`** — AES-256-GCM secret box, HMAC-SHA256, timing-safe compare, `randomOpaqueBytes`.
- **`packages/auth-core`** — CSRF double-submit compare, base64url opaque tokens, canonical cookie/header names.
- **`packages/observability`** — `createFortressLogger`, **`fortressPinoRedactPaths()`** export for nestjs-pino.
- **`packages/sdk`** — `createFortressSdk`, `AuthMeResponseSchema` (Zod strict), `normalizeBaseUrl`; `engines.node` pinned.
- **`packages/testing`** — Vitest fixtures importing `@fortress/types`.
- **`apps/api`** — Nest bootstrap shell (`P2-T1`): `EnvConfigModule` + env schema, no controllers.
- **`@types/node`** — root `devDependencies` for workspace `tsc` with `types: ["node"]`.

## What Works

- `pnpm --filter api` `build` / `lint` / `typecheck` / `test`; root Turbo includes `api`.
- Smoke tests in each new package (`vitest run`).

## What Is Not Built Yet

- Drizzle-backed DB layer, migrations, middleware, session/audit, health (**`P2-T2`** onward).

## Known Problems

None.

## Important Files or Folders

- `/apps/api` — Nest API (`P2-T1` shell).  
- `/ai/HANDOFF.md` — next-session baton  
- `/packages/sdk` — web↔API typed boundary  
- `/packages/crypto`, `/packages/auth-core` — security helpers for API (when built)

## Next Recommended Action

1. Confirm **GitHub Actions CI is green** after the P2-T1 push (manual check on GitHub).
2. Implement **`P2-T2`** per `/ai/TASKS.md`.
3. When passing `<N>` to `./run-phase-cursor.sh`, pass exactly the Phase 2 task count — do not cross a phase boundary unattended (ADR-022).

## Session reconciliation

2026-05-09 — **P2-T1**: workspace `pnpm lint` / `typecheck` / `test` / `build` + `audit --audit-level=high` (clean). Older CHAT_END entries remain in `DONE_LOG.md`.
