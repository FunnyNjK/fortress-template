# Done Log

Last Updated: 2026-05-09

## 2026-05-09
- Migrated dev environment from WSL-on-Windows to dedicated native Ubuntu 26
  LTS host (ADR-023 supersedes ADR-001). Updated 16 files across the repo to
  remove WSL-specific language, Windows paths, and PowerShell setup script
  references. `setup.ps1` is no longer in scope per ADR-023; only `setup.sh`
  remains. Docker continues to host supporting services (Postgres, Redis,
  mailpit, Azurite, Unleash) via `docker-compose up -d`; apps still run as
  native Node processes via `pnpm dev`.

## 2026-05-08
- Stage 2 of Fortress kickoff: Phase 0 task breakdown (P0-T1 through P0-T8) +
  `/PHASE_MANIFEST.md` + `/phase-manifest.json` produced.
- Stage 1 of Fortress kickoff: `/ai/` planning files realigned from
  ai-starter (Astro + Azure SWA + Functions) to Fortress (NestJS + Drizzle +
  Postgres + Redis + Clerk). ADRs 011–022 added; ADRs 002, 005, 007 superseded.

## 2026-05-02
- Created customized AI project starter for WSL-native dev with Astro 5 +
  React 19 + Tailwind 4 + Azure SWA stack.
- Added `/ai/START_HERE.md` as the single AI entry point.
- Added cross-project rules in `/ai/AI_RULES.md` and `/ai/DEV_ENVIRONMENT.md`.
- Pre-populated cross-project ADRs ADR-001 through ADR-010.
- Added project planning, architecture, task, testing, deployment, decision,
  and handoff files.
