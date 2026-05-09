# AI Handoff

Last Updated: 2026-05-09

> **Target shape: ≤ 50 lines.** Baton, not a diary.

## Current State Summary

**Phase 2 in progress.** `P2-T1` landed: NestJS 11 **`apps/api`** scaffold — global `EnvConfigModule` + Zod env validation (rejects `replace-with-*` when `NODE_ENV=production`), `nestjs-pino` redaction paths via **`fortressPinoRedactPaths()`** from `@fortress/observability`.

## Last Completed Task

**P2-T1** — see `DONE_LOG.md`.

## Active Task

**`P2-T2`** — Drizzle ORM + Postgres + `users` table (`Unattended: Yes`).

## Next Recommended Task

Implement **`P2-T2`** per `/ai/TASKS.md`; keep API DB-only boundary (`AGENTS.md`).

## What Is Blocked

None.

## Important Instructions for Next AI

- Confirm **CI green on `origin/main`** after pushes (GitHub Actions).
- Phase 2 tasks **`P2-T2`–`P2-T6`** remain **`Unattended: Yes`** (matrix in `/ai/TASKS.md`).
- **`pnpm`** may require `corepack prepare pnpm@10.33.4 --activate` or **`npx pnpm@10.33.4 <cmd>`** when `pnpm` is not on `PATH`.
- **`pnpm approve-builds`** may be needed locally if installs ignore `@nestjs/core` lifecycle scripts (template default).
- Pull-rebase before planning-file edits; deltas only (`/ai/templates/CHAT_END_PROMPT.md`).
- Harness `<N>` equals remaining Phase 2 task count; humans gate phase boundaries (ADR-022).

## Known Risks

- Workspace `engines.node` / `.node-version` must stay aligned with `packages/sdk`.

## Tests / Checks Last Run

- Workspace `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` (via `npx pnpm@10.33.4` when `pnpm` absent from PATH), `pnpm audit --audit-level=high`; YAML parse `ci.yml` / `dependabot.yml`; `bash -n scripts/setup.sh`; `grep -c replace-with-` `.env.example` (=27); matched `origin/main` when run.
