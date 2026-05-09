# Current State

Last Updated: 2026-05-10

> **Target shape: ≤ 80 lines.** Snapshot only — implementation detail in DONE_LOG.md.

## Current Phase

**Phase 1 (Shared packages) — complete.** `P1-T1`–`P1-T6` landed. Post-Phase-1
cleanup commit (2026-05-10) restored the migration ADR, fixed manifest drift,
removed stray `scripts/setup.ps1`, hardened docker-compose env handling, and
upgraded the CHAT_END process. Next: **Phase 2** (API skeleton).

## Current Task

None active — decompose Phase 2 in `/ai/TASKS.md` before coding `apps/api`.

## What Exists Now

- Root monorepo skeleton (unchanged from Phase 0): `pnpm-workspace.yaml`, Turbo, CI, `docker-compose`,
  `.env.example`, setup scripts — see prior entries.
- **`packages/types`** — branded boundary types, `FORTRESS_API_VERSION`, pagination input shape; zero runtime deps.
- **`packages/crypto`** — AES-256-GCM secret box, HMAC-SHA256, timing-safe compare, `randomOpaqueBytes`.
- **`packages/auth-core`** — CSRF double-submit compare, base64url opaque tokens, canonical cookie/header names.
- **`packages/observability`** — `createFortressLogger` (Pino + default redaction paths).
- **`packages/sdk`** — `createFortressSdk`, `AuthMeResponseSchema` (Zod strict), `normalizeBaseUrl`; `engines.node` pinned.
- **`packages/testing`** — Vitest fixtures importing `@fortress/types`.
- **`@types/node`** — root `devDependencies` for workspace `tsc` with `types: ["node"]`.
- No `apps/*` yet — Phase 2.

## What Works

- `pnpm run build` / `lint` / `typecheck` / `test` via Turbo across all packages including new libraries.
- Smoke tests in each new package (`vitest run`).

## What Is Not Built Yet

- **`apps/api`** onward (Phases 2–8).

## Known Problems

None.

## Important Files or Folders

- `/ai/HANDOFF.md` — next-session baton  
- `/packages/sdk` — web↔API typed boundary  
- `/packages/crypto`, `/packages/auth-core` — security helpers for API (when built)

## Next Recommended Action

1. Confirm **GitHub Actions CI is green** on `origin/main` after the cleanup commit (manual check on GitHub).
2. Decompose Phase 2 in `/ai/TASKS.md` and scaffold `apps/api` (NestJS 11).
3. When passing `<N>` to `./run-phase-cursor.sh`, pass exactly the Phase 2 task count — do not let the harness cross a phase boundary unattended (per `/PHASE_MANIFEST.md` discipline note and ADR-022).

## Session reconciliation

CHAT_END (2026-05-09): Ran `/ai/templates/CHAT_END_PROMPT.md`; matched `origin/main` (clean); YAML parse
(`ci.yml`, `dependabot.yml`); `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm audit --audit-level=high` (clean);
`bash -n scripts/setup.sh`; `grep -c replace-with-` `.env.example` (=27). ARCHITECTURE / ROADMAP / TESTING /
DEPLOYMENT / DECISIONS untouched this pass.
