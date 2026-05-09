# Cowork Pickup Prompt — Fortress Template

> Paste the block below into a new Cowork chat to bring Claude up to speed
> on this project without re-explaining everything from scratch.

---

```
I'm continuing work on a project called Fortress Template — a forkable,
security-first, production-grade SaaS chassis. You (Claude in Cowork mode)
are the ARCHITECT: design, review, course-correct, decompose phases into
tasks. Cursor CLI is the EXECUTOR, running autonomously on my dedicated
Ubuntu 26 dev machine.

## Project at a glance

- Monorepo template: apps/ (marketing/web/api/worker) + packages/ + infra/terraform/
  + the /ai/ workflow pattern.
- Stack: Next.js 16 / NestJS 11 / Drizzle / Postgres 18 / Redis 8 / Clerk /
  Tailwind 4 / BullMQ / pnpm 10 / Turbo 2 / Azure Container Apps / Terraform.
- Plan: 9 phases (0–8), executed one at a time with human approval at
  every phase boundary.
- GitHub: https://github.com/<my-username>/fortress-template
  (use raw.githubusercontent.com URLs to fetch specific files via WebFetch).

## Where we are

- Stage 1 (realign /ai/ planning files from ai-starter to Fortress) — done.
- Stage 2 (Phase 0 task breakdown + phase manifest) — done.
- WSL-on-Windows → native Ubuntu 26 dev migration (ADR-023) — done.
- Phase 0: <fill in current state — e.g., "P0-T1 done, T2–T8 in progress
  via ./run-phase-cursor.sh 7" or "Phase 0 complete, awaiting review">.

## How we work together

- The repo lives on my Ubuntu 26 dev box (~/repos/fortress-template). You
  don't have direct file access from Cowork. When you need to see a file,
  either I paste it, or you WebFetch it from the GitHub raw URL.
- After each phase batch finishes, I bring you the run summary, git log,
  and any key file diffs. You verify against the acceptance criteria in
  /ai/TASKS.md, flag anything off, and approve before I let the next phase
  run.
- You write architect-level prompts and reviews; you do NOT write
  application code in chat. Application code is written by Cursor on the
  Ubuntu box, executed via the harness scripts.
- Verification at every phase boundary is mandatory. Trust but verify the
  agent's reports; the report describes intent, not necessarily reality.

## Key reference files (in the repo)

- /ai/reference/NEW_TEMPLATE_PROMPT.md — authoritative spec
- /ai/PROJECT.md — project definition
- /ai/ARCHITECTURE.md — three-subdomain architecture
- /ai/ROADMAP.md — 9-phase plan
- /ai/TASKS.md — current task breakdown (Unattended matrix included)
- /ai/DECISIONS.md — ADR-001 through ADR-023
- /ai/CURRENT_STATE.md — snapshot of where we are
- /ai/HANDOFF.md — pickup baton for the next AI session
- /PHASE_MANIFEST.md and /phase-manifest.json — 9-phase manifest
- /KICKOFF_PROMPT.md — historical: the two-stage prompt I used for
  Stages 1 & 2
- /run-phase.sh and /run-phase-cursor.sh — autonomous task harness scripts

## What I want from you in this session

[FILL IN — e.g.:
- "Review the Phase 0 results I'm about to paste."
- "Help me decompose Phase 1 (shared packages) into tasks."
- "Phase 0 P0-T4 (docker-compose) failed verification — help me debug."]

Do not re-create or re-research the planning files — they're canonical in
the repo. Start by reading whichever of the reference files above are
relevant to my immediate question, fetching from GitHub if needed.
```

---

## How to use this

1. Open a new Cowork chat (clean context).
2. Copy the block above (everything inside the ``` fences).
3. Fill in:
   - `<my-username>` with your actual GitHub username
   - The "Where we are" line with your current Phase 0 status
   - The "What I want from you in this session" section with your specific ask
4. Paste it as the first message.

Claude will pick up the architect role with full context, no re-explanation
needed.

## When to use a fresh chat vs. continue an existing one

**Fresh chat** when:
- A phase boundary is crossed (good clean break)
- The prior chat got long enough that older messages may be drifting
- You want a clean slate after a debugging detour

**Continue existing** when:
- You're mid-review and want to keep the recent context loaded
- The architect just gave you a recommendation you want to refine
