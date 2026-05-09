# AI Handoff

Last Updated: YYYY-MM-DD

> **Target shape: ≤ 50 lines.** This file is a baton, not a diary.
> If it grows past ~50 lines, move per-task implementation history into
> `DONE_LOG.md` and replace it here with a one-line pointer.

## Current State Summary
One short paragraph (≤ 5 sentences). What phase, what's the live focus,
what is `origin/main` actually at right now.

## Last Completed Task
`P{phase}-T{n}: {title}` — Done {date} (commit `{shortsha}` on `origin/main`).
One-sentence outcome. Full detail lives in `DONE_LOG.md`.

## Active Task
None.
— OR —
`P{phase}-T{n}: {title}` — In Progress. Working on {one-line scope}.

## Next Recommended Task
`P{phase}-T{n}: {title}`. One-sentence why-this-next. Pointer to the
acceptance criteria in `TASKS.md`.

## What Is Blocked
- Bullet, one line each. If nothing is blocked, write "Nothing."
- Include external blockers (waiting on user, waiting on third-party).

## Important Instructions for Next AI
- Read `/ai/START_HERE.md` first.
- Honor `/ai/AI_RULES.md` and `/ai/DEV_ENVIRONMENT.md` as non-negotiable.
- {Project-specific gotcha 1, one line.}
- {Project-specific gotcha 2, one line.}
- Update `CURRENT_STATE.md`, `TASKS.md`, `HANDOFF.md`, `DONE_LOG.md`
  before ending the session. Push after every commit.

## Known Risks
- Bullet, one line each. Leave open risks here; resolved risks move to
  `DONE_LOG.md` under the resolving task.

## Tests / Checks Last Run
- `pnpm lint` — {pass/fail, count}
- `pnpm typecheck` — {pass/fail}
- `pnpm test` — {N passed / M failed}
- `pnpm build` — {pass/fail, page count}
