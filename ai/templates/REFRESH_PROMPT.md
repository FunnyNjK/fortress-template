# Project Refresh Prompt

Use this prompt against an EXISTING project that was started from an older
version of `ai-starter`, to bring its `/ai` folder in line with the current
conventions.

This is a one-shot housekeeping pass. It does not change application code —
only the `/ai` planning files, `README.md` if missing, and `AI_RULES.md`.

---

## Prompt to paste to the AI assistant

```text
You are running the `ai-starter` project refresh pass against this repo.

Read these files first, in order:
1. /ai/START_HERE.md
2. /ai/AI_RULES.md
3. /ai/PROJECT.md
4. /ai/DECISIONS.md
5. /ai/CURRENT_STATE.md
6. /ai/HANDOFF.md
7. /ai/TASKS.md

Then perform the seven checks below. For each check, report what you found,
what you changed, and link to the file(s) you touched. Do NOT proceed to
the next check until the current one is reported.

Throughout: never modify /DEVELOPER-NOTES.md (developer-owned). Never
modify any file the user has flagged as personal/private. If you are
unsure whether a file is in scope, ask before editing it.
```

### Check 1 — Dependency / runtime version sweep (bidirectional)

Cross-check every dependency, language version, and toolchain pin
mentioned in `PROJECT.md`, `ARCHITECTURE.md`, `DEPLOYMENT.md`, and any
ADR in `DECISIONS.md`, against the actual values in:

- `package.json` (`dependencies`, `devDependencies`, `engines.node`,
  `packageManager`, `pnpm.overrides`)
- `.nvmrc`
- `.github/workflows/ci.yml` (action versions, Node version)
- `.github/dependabot.yml` (if present)

If the docs say one version and the repo uses another, fix the docs to
match the repo (NOT the other way around — the lockfile is the truth).

If the repo is on a stale major (e.g., still on Node 22 when current LTS
is Node 24, or pinned to an old framework major) flag it as a separate
finding for the user — do NOT bump the repo silently. A version bump
needs its own ADR and its own task.

For Node specifically: verify Azure Functions still supports the
declared runtime version. If not, that's a deployment-blocking finding —
report it, do not deploy.

### Check 2 — Compact `CURRENT_STATE.md` to ≤ 80 lines

Read `/ai/templates/CURRENT_STATE.template.md` for the target shape.
Rewrite `CURRENT_STATE.md` to that shape:

- A short paragraph per section, not a per-task transcript.
- Move displaced detail (per-task implementation notes, file lists,
  build artifact counts) into the matching dated entry in `DONE_LOG.md`.
- Preserve every fact — only the location changes.
- Update the `Last Updated:` date at the top.

### Check 3 — Compact `HANDOFF.md` to ≤ 50 lines

Read `/ai/templates/HANDOFF.template.md` for the target shape. Rewrite
`HANDOFF.md` to that shape:

- "Last Completed Task" = one block with task ID, title, commit, and
  one-sentence outcome. Detail goes in `DONE_LOG.md`.
- "Important Instructions for Next AI" stays focused on the live
  gotchas that affect the next session. Anything resolved moves to
  `DONE_LOG.md` or simply gets dropped.
- Update the `Last Updated:` date at the top.

### Check 4 — Archive Done tasks from `TASKS.md` into `DONE_LOG.md`

For every task in `TASKS.md` with status `Done`:

1. Confirm the task is already represented in `DONE_LOG.md`. If not,
   add a dated entry with task ID, title, key commit hash(es), and a
   one-sentence outcome.
2. Remove the full task block from `TASKS.md`.
3. Optionally leave a one-line pointer in `TASKS.md` under a `## Done
   (archived)` section: `### P2-T8: Build Monitoring service page —
   Done; see DONE_LOG.md`. This is acceptable but not required.

`TASKS.md` after this pass should contain only `Active`, `Ready`,
`Backlog`, `Blocked`, `Review` items. Update the `Last Updated:` date.

### Check 5 — `README.md` exists at repo root

Check whether `/README.md` exists at the repo root.

If it does NOT exist, create one with:

- The project name and a one-paragraph description (lifted from
  `/ai/PROJECT.md`).
- Tech-stack one-liner.
- Quick-start commands (`pnpm install`, `pnpm dev`, expected URL).
- A pointer to `/ai/START_HERE.md` for the AI workflow.
- A "Last Updated" line at the top.

If it DOES exist, leave it alone unless the user asks for a refresh.

### Check 6 — `AI_RULES.md` has the current hard rules

Confirm `AI_RULES.md` contains all of these rule blocks. If any are
missing, add them (do not duplicate if already present):

- "Development Environment Rules (Hard)" — WSL-native, no Docker for
  dev, no `/mnt/c` paths.
- "Git Rules (Hard)" — push after every successful commit unless
  explicitly told otherwise; surface push failures; `origin/main` is
  the source of truth for planning files.
- "Planning-File Hygiene Rules (Hard)" — `TASKS.md` is active work
  only (Done moves to `DONE_LOG.md`); `CURRENT_STATE.md` ≤ 80 lines;
  `HANDOFF.md` ≤ 50 lines; add `Last Updated: YYYY-MM-DD` to every
  planning file when changing it.
- "General Rules", "Coding Rules", "Review Rules", "Handoff Rules"
  blocks (cross-project standard).

Update the `Last Updated:` date if anything changed.

### Check 7 — `origin/main` matches local `main`

Run `git status` and `git log --oneline origin/main..HEAD` (or
equivalent for the project's default branch).

- If local is ahead of origin: report each unpushed commit by short SHA
  and subject. Recommend a `git push` and stop until the user confirms.
  Do NOT update planning files to claim work is "on `origin/main`" if
  it isn't.
- If local matches origin: report "clean — `origin/main` matches local."
- If origin is ahead of local: recommend a `git pull` before further
  edits.

---

## Final report shape

After all seven checks complete, the AI returns a single summary:

```text
Refresh complete.

Files changed:
- {list}

Findings flagged for user attention (not auto-fixed):
- {list, e.g., "Node 22 → Node 24 bump recommended (separate ADR + task)"}

Pending pushes:
- {list, or "none"}

Suggested next step:
- {one sentence}
```
