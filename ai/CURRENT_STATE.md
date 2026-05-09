# Current State

Last Updated: 2026-05-09

> **Target shape: ≤ 80 lines.** Snapshot only — implementation detail in DONE_LOG.md.

## Current Phase

Phase 0 (Repo skeleton) — **complete**. P0-T1–P0-T8 done. Next: Phase 1 (shared packages).

## Current Task

None active — plan/decompose Phase 1 before coding (`/ai/ROADMAP.md`).

## What Exists Now

- Root monorepo skeleton: `pnpm-workspace.yaml`, `turbo.json`, `package.json` (pnpm
  10.33.4 + turbo 2.9.12), `typescript` 5.8.3 (root `devDependencies`), `pnpm-lock.yaml`,
  `.node-version` (24.15.0), `.editorconfig`, `.prettierrc`. Existing `.gitignore`
  already met Phase 0 secret/output patterns.
- `packages/config-typescript/` — `@fortress/config-typescript` presets (`base`,
  `next`, `node`, `library`) + tooling stub + package-path `tsconfig` check.
- `packages/config-eslint/` — `@fortress/config-eslint` flat configs (`base`, `next`,
  `node`), self-lint via `eslint.config.js`; `pnpm run lint` runs this package.
- `docker-compose.yml` — Postgres 18, Redis 8, Mailpit, Azurite, Unleash; images
  pinned by digest; `docker/postgres/docker-entrypoint-initdb.d/` creates `unleash`
  database on the shared Postgres instance.
- `.env.example` — canonical env template (`replace-with-*` placeholders; local URLs
  use `127.0.0.1` ports aligned with `docker-compose.yml`).
- `scripts/setup.sh`, `scripts/setup.ps1` — idempotent local `.env` + `docker compose up -d`.
- `.github/workflows/ci.yml` — nine-job CI (install, lint, typecheck, test, dep-audit,
  gitleaks, semgrep, codeql, sbom); actions pinned by SHA; push + `pull_request`.
- `.github/dependabot.yml` — weekly `npm` + `github-actions` updates.
- `.gitleaks.toml` — baseline secret scan config (allowlists `.env.example`).
- `.well-known/security.txt` — disclosure placeholders (forks must replace).
- `AGENTS.md` — AI layer rules + non-negotiables.
- `PROJECT_STATUS.md` — phase/decision/status snapshot with doc links.
- No `apps/` yet; Phase 1+ pending.

## What Works

- `pnpm install` from repo root; `pnpm run typecheck` runs `@fortress/config-typescript`
  via Turbo; `pnpm run lint` runs `@fortress/config-eslint` lint.
- `docker compose config` validates the stack; `docker compose up -d` brings up
  supporting services (manual smoke).
- CI workflow present locally; green run after push is manual confirmation on GitHub.

## What Is Not Built Yet

- All application code and Phases 1–8 per roadmap (`packages/sdk` onward).

## Known Problems

None.

## Important Files or Folders

- `/ai/HANDOFF.md` — next session baton
- `/ai/TASKS.md` — Phase 0 done; Backlog = Phase 1+
- `AGENTS.md`, `PROJECT_STATUS.md` — agent + status contract
- `.github/workflows/ci.yml` — CI gates
- `.env.example` — env var catalog for setup scripts and forks
- `docker-compose.yml` — local backing services
- `packages/config-typescript/` — shared TS configs
- `packages/config-eslint/` — shared ESLint flat configs

## Next Recommended Action

1. Confirm CI green on `main` after P0-T8 lands.
2. Decompose **Phase 1** in `/ai/TASKS.md` and start shared packages.

## Session reconciliation

CHAT_END (2026-05-09): **P0-T8** completed; disclosure + agent/status files added; Phase 0 closed.
