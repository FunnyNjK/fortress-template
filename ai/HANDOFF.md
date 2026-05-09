# AI Handoff

Last Updated: 2026-05-09

> **Target shape: ≤ 50 lines.** Baton, not a diary.

## Current State Summary

**Phase 2 in progress.** **`P2-T2` complete**: Drizzle **`0.45.2`** + **`drizzle-kit` `0.31.10`** + **`pg` `8.20.0`** on **`apps/api`**: global **`DbModule`**, **`DRIZZLE`** / **`PG_POOL`** tokens (pool shutdown via **`PgPoolLifecycle`**), **`users`** schema + **`apps/api/drizzle/`** migration **`0000_*.sql`**, env **`DATABASE_URL`** (Zod + postgres URL gate). Scripts **`db:generate`** / **`db:migrate`** / **`db:studio`**. **`test/setup-env.ts`** default URL for Vitest when unset. CI **`test`** job: Postgres service **`fortress` / `test`**, host **`postgres`**, port **`5432`**. Integration **`test/db/users.integration.test.ts`**: migrate, insert+read, **`ctx.skip`** when DB unreachable.

## Last Completed Task

**P2-T2** — see `DONE_LOG.md`.

## Active Task

**`P2-T3`** — `audit_events` + `sessions` schemas + migration (`Unattended: Yes`).

## Next Recommended Task

Implement **`P2-T3`** per `/ai/TASKS.md`; keep API DB-only boundary (`AGENTS.md`).

## What Is Blocked

None.

## Important Instructions for Next AI

- Confirm **CI green on `origin/main`** after pushes (GitHub Actions).
- Phase 2 tasks **`P2-T3`–`P2-T6`** remain **`Unattended: Yes`** (matrix in `/ai/TASKS.md`).
- **`pnpm`** may require `corepack prepare pnpm@10.33.4 --activate` or **`npx pnpm@10.33.4 <cmd>`** when `pnpm` is not on `PATH`.
- **`pnpm approve-builds`** may be needed locally if installs ignore `@nestjs/core` lifecycle scripts (template default).
- Pull-rebase before planning-file edits; deltas only (`/ai/templates/CHAT_END_PROMPT.md`).
- Harness `<N>` equals remaining Phase 2 task count; humans gate phase boundaries (ADR-022).

## Known Risks

- Workspace `engines.node` / `.node-version` must stay aligned with `packages/sdk`.

## Tests / Checks Last Run

- CHAT_END (2026-05-09): `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`; `pnpm audit --audit-level=high` (moderate advisory, below gate); `python3` YAML load `ci.yml` / `dependabot.yml`; `bash -n scripts/setup.sh`; `grep -c replace-with-` `.env.example` (=27).
