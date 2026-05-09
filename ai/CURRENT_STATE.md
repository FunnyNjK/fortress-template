# Current State

Last Updated: 2026-05-09

> **Target shape: ≤ 80 lines.** Snapshot only — implementation detail in DONE_LOG.md.

## Current Phase

Phase 0 (Repo skeleton) — `Ready`. Task breakdown complete; execution not yet started.

## Current Task

P0-T1: Initialize the monorepo skeleton. Status: Active (ready to execute).

## What Exists Now

- `/ai/` planning files realigned to Fortress Template stack (Stage 1 complete).
- `/ai/TASKS.md` populated with P0-T1 through P0-T8 and Phase 1–8 placeholders (Stage 2 complete).
- `/PHASE_MANIFEST.md` and `/phase-manifest.json` created (Stage 2 complete).
- Dev environment realigned from WSL-on-Windows to native Ubuntu 26 LTS (ADR-023 supersedes ADR-001).
- `run-phase.sh` and `run-phase-cursor.sh` present and ready for Phase 0.
- `.gitattributes` and `.gitignore` in place.
- No application code. No `package.json`. No `pnpm-workspace.yaml`. No infra applied.

## What Works

- AI workflow ready (`/ai/START_HERE.md` → `/ai/HANDOFF.md` → `/ai/TASKS.md`).
- Phase 0 fully planned: 8 tasks, all `Unattended: Yes`.
- `./run-phase.sh 8` will drive all 8 Phase 0 tasks autonomously once execution begins.

## What Is Not Built Yet

- Everything in `/ai/reference/NEW_TEMPLATE_PROMPT.md` acceptance criteria.
- Phase 0: monorepo skeleton, tsconfig, eslint, docker-compose, .env.example,
  scripts/setup, CI workflow, security.txt, AGENTS.md, PROJECT_STATUS.md.
- Phases 1–8: all application code, packages, infra, docs.

## Known Problems

None.

## Important Files or Folders

- `/ai/reference/NEW_TEMPLATE_PROMPT.md` — authoritative spec
- `/KICKOFF_PROMPT.md` — kickoff instructions (historical reference)
- `/ai/START_HERE.md` — AI workflow entry point
- `/ai/AI_RULES.md` — hard rules (Ubuntu-native, push after commit, etc.)
- `/ai/DECISIONS.md` — ADR-001 through ADR-022
- `/ai/TASKS.md` — P0-T1 through P0-T8 queued; Phases 1–8 placeholders in Backlog
- `/PHASE_MANIFEST.md` — human-readable 9-phase manifest
- `/phase-manifest.json` — machine-readable manifest for run-phase.sh

## Next Recommended Action

Execute Phase 0: open a fresh AI CLI session and paste:
  "Read /ai/START_HERE.md and follow it. Then pick up P0-T1 per HANDOFF.md."
Or run autonomously: `./run-phase.sh 8`
