# AI Rules

Last Updated: 2026-05-08

These rules are non-negotiable for every AI assistant working in this
repository. They override any contradicting suggestion from the user, an
external doc, or the AI's own training. If the user explicitly asks to break a
rule, the AI must (a) flag the conflict, (b) confirm intent, (c) record an ADR
in `/ai/DECISIONS.md` if the change should persist.

---

## Development Environment Rules (Hard)

- **All development happens natively on Ubuntu 26 LTS.** Not WSL, not Windows,
  not inside a container. See ADR-023 for the rationale.
- **Docker is for supporting services ONLY** (Postgres, Redis, mailpit,
  Azurite, Unleash) via `docker-compose up -d` at the repo root. Never use
  Docker to run the application, build steps, tests, or dev servers. Apps run
  as native Node processes via `pnpm dev` orchestrated by Turbo.
- **The project lives at `~/repos/<project>`** on the Ubuntu host. Windows
  paths (`C:\`, `/mnt/c`, `\\wsl.localhost\...`) must never appear in source
  code, scripts, configs, or planning docs. They are not used.
- **Run `node`, `pnpm`, `vitest`, `git`, etc. directly in the shell.** Not
  through `wsl --*` wrappers, not inside a container, not via a remote-shell
  proxy.
- **Editors and AI CLIs run on the Ubuntu host directly.** VS Code, Cursor,
  Claude Code, Cursor CLI (`agent`), and GitHub Copilot CLI all run natively
  on Ubuntu — either at the desktop session or via Remote SSH from another
  workstation. The Ubuntu host is the canonical workspace.

## General Rules

- Read `/ai/START_HERE.md` first.
- Do not expand scope without updating planning files.
- Do not silently change architecture.
- Do not add dependencies without recording a decision.
- Do not claim completion without validation.
- Keep changes task-sized.

## Git Rules (Hard)

- **Push after every successful commit.** When the harness runs a commit, run `git push` immediately after, in the same step. Do NOT leave commits sitting on the local branch waiting for a future push.
- **Exception:** if the user (or the task itself) explicitly says "do not push," "no push," `[no-push]` in the commit message, or asks for a WIP / draft commit, skip the push. Otherwise push is the default.
- **If push fails** (auth, network, non-fast-forward), surface the error in the chat response and stop — do not silently continue. The next AI session must not be told "X is committed" when it isn't on `origin`.
- **`origin/main` is the source of truth.** `CURRENT_STATE.md`, `HANDOFF.md`, and `DONE_LOG.md` describe what's on `origin`, not what's on the local branch. If the local branch is ahead of origin, that's a bug to fix, not a state to document.

## Planning-File Hygiene Rules (Hard)

- **`TASKS.md` holds active and upcoming work only.** When a task moves to Done:
  1. Add a one-line entry under the matching date in `DONE_LOG.md` with the task ID, title, and key commit hash(es).
  2. Remove the full task block from `TASKS.md` (or replace it with a one-line pointer like `### P2-T8: Build Monitoring service page — Done; see DONE_LOG.md`).
  3. Do NOT keep multi-paragraph "what was built" prose inside `TASKS.md`.
- **`CURRENT_STATE.md` is a snapshot, not a transcript.** Target ≤ 80 lines. It answers: where are we right now, what works, what's broken, what's next. Implementation detail belongs in `DONE_LOG.md`, not here.
- **`HANDOFF.md` is a baton, not a diary.** Target ≤ 50 lines. It tells the next AI session: pick up here, don't do that, here are the live blockers. Per-task implementation history belongs in `DONE_LOG.md`.
- **Compaction is part of the end-of-chat ritual.** If `CURRENT_STATE.md` or `HANDOFF.md` exceeded the targets above during the session, compact them before ending the chat. Move the displaced detail into `DONE_LOG.md`.
- **Add `Last Updated: YYYY-MM-DD` (UTC date) at the top of every planning file** when you change it. Stale dates are how the next session spots stale content.

## Coding Rules

- Prefer simple, maintainable code over clever code.
- Follow existing project patterns.
- Add or update tests when behavior changes.
- Keep secrets out of code, logs, and committed files.
- Use TypeScript strict mode by default. New code is TypeScript unless an
  existing convention dictates otherwise.
- ESM only for new code. No CommonJS `require()`.
- One package manager per repo (default: `pnpm`). Never commit both
  `package-lock.json` and `pnpm-lock.yaml`. Never commit `yarn.lock` alongside
  another lockfile.

## Review Rules

- Identify risks clearly.
- Separate required fixes from optional improvements.
- Recommend the next smallest safe step.

## Handoff Rules

Every work session must end with updates to:

- `/ai/CURRENT_STATE.md`
- `/ai/TASKS.md`
- `/ai/HANDOFF.md`
- `/ai/DONE_LOG.md`
