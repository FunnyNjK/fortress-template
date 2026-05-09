# CLAUDE.md

This file is read by Claude Code (and other AI CLIs that look for `CLAUDE.md`)
when entering this repository. It points at the canonical layer rules and
workflow conventions; it does not duplicate them.

## Start here

1. Read **`/AGENTS.md`** for the layer rules (web never touches the database;
   API is the sole DB owner; SDK is the typed contract; etc.) and the 10 locked
   architectural decisions every AI session must respect.
2. Read **`/ai/START_HERE.md`** for the AI workflow: context loading order,
   start-of-chat / end-of-chat ritual, scope control, completion standard.
3. Read **`/ai/AI_RULES.md`** for the non-negotiable hard rules (Ubuntu-native
   per ADR-026, push after every commit, planning-file hygiene, etc.).
4. Read **`/ai/CURRENT_STATE.md`** and **`/ai/HANDOFF.md`** to find the active
   task and the pickup baton.

## Core rules at a glance (do not skip the source files above)

- All development happens natively on Ubuntu 26 LTS. Not WSL, not Windows,
  not inside a container. Docker is for local supporting services only.
- The repo lives at `~/repos/<project>` on the Ubuntu host. Windows paths
  (`C:\`, `/mnt/c`, `\\wsl.localhost\...`) must never appear in source code,
  scripts, configs, or planning docs.
- Do not write business logic in shared packages or in the template itself —
  the template is the chassis, not the car.
- Every privileged action is auditable. Every inbound boundary is validated
  with Zod. Secrets never live in code or in the repository.
- Push after every successful commit. If push fails, stop and surface the
  error — do not silently continue.

## Phase boundary discipline

Per ADR-022, each of the 9 phases (0–8) is its own AI session, gated by
explicit human approval. The autonomous harness scripts (`run-phase.sh`,
`run-phase-cursor.sh`) run `<N>` consecutive tasks then exit. The boundary
between phases is enforced by the human passing the right `<N>` — not by the
script. Pass exactly the remaining task count for the active phase, then
review before starting the next phase.

## CHAT_END hygiene

`/ai/templates/CHAT_END_PROMPT.md` has hard rules at the top: pull-rebase
first, edit deltas not full files, read-before-edit, verify-after-edit.
These exist because past CHAT_END passes silently lost ADR content. Do not
skip them.

## When in doubt

Refer to `/ai/reference/NEW_TEMPLATE_PROMPT.md` (the authoritative spec) and
`/ai/DECISIONS.md` (every architectural decision with rationale). The
template's phase plan, security baseline, acceptance criteria, and
non-negotiables all live in those two files.
