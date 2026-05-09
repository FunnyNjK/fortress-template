# Phase Review Prompt

> Use this prompt at every phase boundary, in a fresh Claude Code session
> running on the Ubuntu dev box (working directory: `~/repos/fortress-template`).
> The reviewer's job is to verify, not to fix. Findings come back to the human
> for a go/no-go decision before the next phase runs.

---

## Prompt to paste

```
You are running a phase-boundary code review. Your job is to verify what
the autonomous Cursor harness produced against the acceptance criteria in
/ai/TASKS.md. You will NOT modify any code or planning files in this session.
You will produce a written verdict and stop.

## What I'm reviewing

[FILL IN — e.g., "Phase 0 — all 8 tasks (P0-T1 through P0-T8)" or
"Phase 0 P0-T2 through P0-T8 (the 7 tasks just run by ./run-phase-cursor.sh 7)"]

## Source-of-truth files (read first, in this order)

1. /ai/AI_RULES.md — non-negotiable rules. Especially Git Rules and Planning-File
   Hygiene. These define what "done" actually requires.
2. /ai/reference/NEW_TEMPLATE_PROMPT.md — the spec. Phase plan section and
   Acceptance criteria section are most relevant.
3. /ai/TASKS.md — the per-task acceptance criteria, scope, and verification steps.
4. /ai/CURRENT_STATE.md and /ai/HANDOFF.md — what the executor claims.
5. /ai/DONE_LOG.md — historical record of what's been completed.
6. /PHASE_MANIFEST.md and /phase-manifest.json — phase status.

## Steps

### Step 1 — Reconstruct what actually happened

Run these and record what you see:

  git log --oneline origin/main..HEAD
  git log --oneline -20
  git status
  git diff --stat origin/main..HEAD

Confirm: how many commits, in what order, do they land cleanly on origin/main?
Per the Git Rules in /ai/AI_RULES.md, every successful task commit should
have been pushed. If origin/main is behind local, that's a finding.

### Step 2 — Verify each task in scope, one at a time

For each task ID being reviewed (P{phase}-T{n}), open /ai/TASKS.md and read
its full block. Then on the actual repo:

  a. Files Likely Involved → confirm each one exists with `ls` or `test -f`.
  b. Scope Included → spot-check that each item is reflected in the actual files.
  c. Scope Excluded → confirm the agent did NOT do those things.
  d. Acceptance Criteria → run each one literally. If it says
     `pnpm install exits 0`, run `pnpm install` and check the exit code.
     If it says a JSON file must contain a specific key, grep for it.
  e. Test Requirements → run them. Don't just trust HANDOFF says they ran.
  f. Verification Step → run the literal command. Capture exit code and output.
  g. Security Considerations → check each. For example: any `latest` Docker
     image tags? Any `^` or `~` version ranges in package.json? Any secrets
     committed in .env or other tracked files? Any /mnt/c or Windows paths?
     Any references to setup.ps1 (which was dropped per ADR-026)?

### Step 3 — Cross-check HANDOFF/DONE_LOG claims against reality

Read /ai/HANDOFF.md and /ai/DONE_LOG.md. For each task the executor claims
to have completed, verify:

  - Was a commit actually made? (git log)
  - Did the verification step actually pass? (rerun it)
  - Are CURRENT_STATE.md and TASKS.md updated to reflect Done?

If HANDOFF says a task was completed but the files don't exist or the
verification command doesn't pass, that's a RED finding.

### Step 4 — Engineering review

For files Cursor created in this scope (especially configs, scripts, and
workflows), do a focused engineering review. Look for:

  - Hardcoded secrets, real credentials, or API tokens (RED)
  - Use of `eval`, `Function()`, or unsafe shell expansion (RED)
  - Action versions in CI not pinned to commit SHA (YELLOW per the spec)
  - Docker images using `latest` tag (RED — the spec forbids it)
  - Version ranges with `^` or `~` in any package.json (YELLOW per the spec)
  - Missing `permissions:` blocks in GitHub Actions jobs (YELLOW)
  - .env, .env.local, or any secret-bearing file tracked in git (RED)
  - Path violations (Windows paths, /mnt/c, etc., per ADR-026) (RED)
  - .ps1 setup scripts (RED — dropped per ADR-026)
  - Code style: doesn't match Prettier/ESLint config in the repo (YELLOW)

If the engineering:code-review skill is available in this Claude Code
session, you can also invoke it for additional depth. Otherwise the manual
checklist above is sufficient for Phase 0 scope.

### Step 5 — Produce the verdict

Output in this exact format:

```
PHASE REVIEW — [phase ID, e.g., "Phase 0"]

## Per-task verdicts

| Task   | Verdict        | Notes                               |
|--------|----------------|-------------------------------------|
| P0-T1  | APPROVED       | All ACs pass, verification clean    |
| P0-T2  | NEEDS FIX      | Missing exactOptionalPropertyTypes  |
| ...    | ...            | ...                                 |

Verdict values: APPROVED / NEEDS FIX / ROLL BACK / SKIPPED.

## Findings

### RED (must fix before approval)
1. [Finding] — [file:line] — [why it's a problem] — [suggested fix]
2. ...

### YELLOW (should fix, not blocking)
1. ...

### GREEN (worth noting, not actionable)
1. ...

## Git state

- Local HEAD: <sha>
- origin/main: <sha>
- LOCAL == ORIGIN: yes/no
- Commits in scope: <list>
- Push needed: yes/no

## Recommendation

[APPROVE / FIX BEFORE NEXT PHASE / ROLL BACK]

[One paragraph explaining the recommendation and the smallest next step
the human should take.]
```

## Hard rules

- Do NOT modify any file in this session. You are reviewing, not building.
- Do NOT run `git commit`, `git push`, `git reset`, or any command that
  changes repo state beyond reading.
- Do NOT continue to the next task or next phase.
- Do NOT trust HANDOFF.md or DONE_LOG.md without verifying against the
  actual repo state. Reports describe intent, not always reality.
- If a verification command fails, capture the full output and include it
  in the findings — don't paraphrase.
- If the engineering:code-review skill is loaded, use it; otherwise stick
  to the manual checklist above.

Begin with Step 1 (reconstruct what happened). Print the git output, then
proceed.
```

---

## How to use this

1. On the Ubuntu dev box, after the harness finishes, open Claude Code in VS Code:
   ```bash
   cd ~/repos/fortress-template
   code .
   ```
2. Open a Claude Code session.
3. Copy the prompt above (everything inside the ``` fences).
4. Fill in the **"What I'm reviewing"** line with the specific scope (which
   tasks, which phase).
5. Paste it as the first message.
6. Claude will run through Steps 1–5 and produce the verdict block at the end.
7. Bring the verdict block back to the architect (a Cowork chat) for sign-off
   before letting the next phase run.

## When to use this

- After every `run-phase*.sh` batch finishes.
- Before pushing if the harness was run with `RUN_PHASE_NO_PUSH=1`.
- Any time you suspect the autonomous executor took a shortcut.

## What to do with the verdict

- **APPROVE** → push (if not already pushed), update HANDOFF.md to point at
  the next phase, kick off the next batch.
- **NEEDS FIX** → create remediation tasks in TASKS.md (e.g., P0-T1-FIX),
  re-run the harness on those, then re-review.
- **ROLL BACK** → `git reset --hard origin/main` (if unpushed) or `git revert`
  (if pushed), then redesign the task definition before re-running.
