# Current State

Last Updated: 2026-05-09

> **Target shape: ≤ 80 lines.** Snapshot only — implementation detail in DONE_LOG.md.

## Current Phase

**Phase 2 (API skeleton) complete.** **Phase 3 (web skeleton)** is next **after explicit human approval** per ADR-022 (**`Unattended: Partial`** — Clerk creds).

## Current Task

**Phase 3** — first scaffold task not yet queued in **`TASKS.md`** (**`HANDOFF`**). Do not start unattended harness for P3 until a human clears the phase boundary.

## What Exists Now

- Root monorepo skeleton (unchanged from Phase 0): `pnpm-workspace.yaml`, Turbo, CI, `docker-compose`,
  `.env.example`, setup scripts — see prior entries.
- **`packages/types`** — branded boundary types, **`FORTRESS_API_VERSION`**, pagination input shape; zero runtime deps.
- **`packages/crypto`** — AES-256-GCM secret box, HMAC-SHA256, timing-safe compare, `randomOpaqueBytes`.
- **`packages/auth-core`** — CSRF double-submit compare, base64url opaque tokens, canonical cookie/header names.
- **`packages/observability`** — **`createFortressLogger`**, **`fortressPinoRedactPaths()`** for nestjs-pino.
- **`packages/sdk`** — **`createFortressSdk`**, **`AuthMeResponseSchema`**, `normalizeBaseUrl`; `engines.node` pinned.
- **`packages/testing`** — Vitest fixtures importing `@fortress/types`.
- **`apps/api`** — Nest + Drizzle + security + auth + **`HealthModule`** (`GET /healthz`, `GET /readyz`), **`@SkipRateLimit()`**; **`test/integration/`** + **`test:integration`**; CI **`api-integration`** job.

## What Works

- `pnpm --filter api` `build` / `lint` / `typecheck` / **`test`** (excludes **`test/integration/**`**) / **`test:integration`**; root Turbo **`test`** (**`pnpm test`**).
- `pnpm --filter api db:generate` (idempotent), `db:migrate` against reachable Postgres; smoke tests in packages.

## What Is Not Built Yet

- **`apps/web`** and Phase 3+ scope.

## Known Problems

None.

## Important Files or Folders

- `/apps/api` — Nest API + Drizzle + health + auth  
- `/apps/api/drizzle` — SQL migrations + meta  
- `/apps/api/test/integration` — Phase 2 supertest aggregation (**`pnpm --filter api test:integration`**)  

## Next Recommended Action

1. **Human**: confirm **GitHub Actions** green (**`api-integration`** + existing jobs) after push.
2. **Human**: review Phase 2 and **explicitly approve Phase 3** before the harness runs P3 tasks (**`Unattended: Partial`**).
3. Decompose **`apps/web`** first task into **`TASKS.md`** / **`HANDOFF`** when Phase 3 starts.

## Session reconciliation

2026-05-09 — **P2-T6**: **`/healthz`**, **`/readyz`**, **`SkipRateLimit`**, **`@fortress/types`** on **`api`**, **`test/integration`**, **`api-integration`** CI, **`README`**.

CHAT_END (2026-05-09): Ritual **`/ai/templates/CHAT_END_PROMPT.md`** — **`origin/main`** **`72b07fb`**; **`npx pnpm@10.33.4`** **`lint`** / **`typecheck`** / **`test`** / **`build`**; **`pnpm audit --audit-level=high`** (1 moderate, below **`high`** gate); YAML **`ci.yml`** + **`dependabot.yml`**; **`bash -n`** **`scripts/setup.sh`**; **`grep -c replace-with-`** **`.env.example`** (=28).
