# AI Handoff

Last Updated: 2026-05-09

> **Target shape: ≤ 50 lines.** Baton, not a diary.

## Current State Summary

P0-T6 complete: `scripts/setup.sh` and `scripts/setup.ps1` generate `.env` from `.env.example`,
append matching `POSTGRES_PASSWORD` / `REDIS_PASSWORD` for Docker Compose, then run
`docker compose up -d`. Active task is **P0-T7** (CI workflow + Dependabot).

## Last Completed Task

P0-T6: Add setup scripts — see DONE_LOG.md.

## Active Task

P0-T7: Add CI workflow scaffolding. Status: Active.

## Next Recommended Task

Execute P0-T7 per `/ai/TASKS.md`, then commit and push.

## What Is Blocked

None.

## Important Instructions for Next AI

- Do not start P0-T8 until P0-T7 is done, committed, and pushed, CI-green per project rules.
- No application/business logic in Phase 0 packages beyond config files.
- Honor `/ai/AI_RULES.md` and `/ai/DEV_ENVIRONMENT.md`.

## Known Risks

- `REFRESH_PROMPT.md` still starter-era; flag when P0-T8 creates `PROJECT_STATUS.md`.

## Tests / Checks Last Run

- P0-T6: `bash -n scripts/setup.sh`; setup idempotence / `--force` / `NODE_ENV=production` guard;
  `grep -c replace-with-` on generated `.env` (=0); `pnpm lint`; `pnpm typecheck`.
