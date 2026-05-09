# Project Init Prompt (Fortress Template Fork)

Use this prompt in a **fresh AI CLI session** running inside a new repo that
was just cloned or forked from `fortress-template`. It converts the generic
template planning files into product-specific planning files for your
application.

This is the sister document to `REFRESH_PROMPT.md`:

- **INIT_PROMPT.md** — first-time setup of a fork of `fortress-template`.
- **REFRESH_PROMPT.md** — housekeeping pass on an existing project that has
  drifted from current conventions.

---

## Prompt to paste to the AI assistant

```text
You are running a project initialization session for a fork of fortress-template.

FORK REPO: current working directory (this is the new application repo).
TEMPLATE ORIGIN: fortress-template (the parent template you forked from).

## Bootstrap checklist

Before editing files, confirm:

- This is a fresh fork of fortress-template, not the template repo itself.
  (If the repo name is "fortress-template", stop — you should not be running
  this prompt against the template. This prompt is for forks.)
- The working directory is the fork, not the template repo.
- The user has supplied an application description (product name, what it does,
  who it is for, what makes it different from a generic SaaS).
- The 10 locked decisions (Clerk, Drizzle, Azure, Postmark, Unleash, Sentry,
  Tempo, SOC 2/GDPR baseline, single-tenant, Astro marketing) are inherited
  and remain in force unless the user explicitly requests an override and a new
  ADR is written.
- Per-product overrides require ADRs starting at ADR-023 (ADR-011 through
  ADR-022 belong to the template).

## Step 1 — Read AI files

Read /ai/START_HERE.md first, then follow its Context Loading Strategy.
Because this is first-time initialization, load the full planning context
instead of only the Fast Context set.
Honor /ai/AI_RULES.md and /ai/DEV_ENVIRONMENT.md as non-negotiable
(Ubuntu-native per ADR-023, no Docker for the application itself, no Windows
paths anywhere in the repo, push after every commit, planning-file size caps).

Glance at /ai/templates/ — HANDOFF.template.md and CURRENT_STATE.template.md
are the target shapes for the compact files you'll write.

## Step 2 — Understand the product

Ask the user (or use the provided description) to understand:
- Product name and tagline
- What problem it solves
- Who the target users are (consumer, prosumer, B2B, etc.)
- What makes it different from a generic CRUD SaaS
- Any domain-specific requirements that might affect the tech stack
  (e.g., high message volume → Postmark volume plan; regulated data → ADR)
- Explicit non-goals (what the product will NOT do)

Do NOT ask about stack choices — those are inherited from fortress-template.
Only ask if the user volunteers a reason to override a locked decision.

## Step 3 — Update planning files (product identity only)

Make /ai/*.md files product-specific. Change:
- /ai/PROJECT.md: product name, description, target users, goals, non-goals.
  Leave the Default Tech Stack table and Non-Negotiables section unchanged —
  the stack is inherited.
- /ai/ARCHITECTURE.md: replace "www.example.com / app.example.com /
  api.example.com" with the actual product subdomain plan. Add any
  product-specific external services to the External Services table.
  Leave all Architecture Rules unchanged.
- /ai/ROADMAP.md: the 9 phases are inherited. Update the Acceptance Criteria
  section to reflect product-specific end states (e.g., "a user can sign up
  and create a [product thing]").
- /ai/TASKS.md: P0-T1 through P0-T8 should already be present (from Stage 2
  of the kickoff). If not, note this as a setup gap. Add Phase 2+ tasks
  that are product-specific (one per major product surface/feature).
- /ai/TESTING.md: add product-specific integration test requirements where
  domain logic warrants it. Leave the base testing strategy unchanged.
- /ai/DEPLOYMENT.md: add any product-specific env vars not already covered.
  Leave the standard variable table intact.
- /ai/DECISIONS.md: add product-specific ADRs starting at ADR-023. Do NOT
  edit ADR-001 through ADR-022 (template-level). If a locked decision is
  being overridden, write a new ADR that supersedes the original and mark
  the original Superseded.
- /ai/CURRENT_STATE.md: reset to "Phase 0 Ready; product identity initialized."
- /ai/HANDOFF.md: update to point at P0-T1 as the next task (or wherever the
  Phase 0 cursor is).

CURRENT_STATE.md ≤ 80 lines. HANDOFF.md ≤ 50 lines. Use the templates
in /ai/templates/.

Add `Last Updated: YYYY-MM-DD` (today's UTC date) to the top of every
planning file you touch.

## Step 4 — Identify product-specific tasks

Queue Phase 2–8 task stubs in /ai/TASKS.md for the product's unique surfaces.
Each stub: task ID (P2-T1, etc.), one-line goal, one-line acceptance criterion.
Full task detail gets filled in when the phase becomes active.

Examples of product-specific Phase 2 tasks:
- API module for [core entity] (CRUD + Drizzle schema)
- API module for [second entity]
- [Integration with a third-party service specific to this product]

Phase 0 and Phase 1 tasks are template-level and do not need product-specific
additions.

## Step 5 — Environment variables

Identify any product-specific env vars not already in /ai/DEPLOYMENT.md
and document them in the Required Environment Variables table.

## Hard rules

- Do NOT scaffold the monorepo, install dependencies, or write application
  code yet. That is Phase 0 execution.
- Do NOT modify the 10 locked decisions without a written ADR and explicit
  user approval.
- Do NOT change /ai/AI_RULES.md or /ai/DEV_ENVIRONMENT.md.
- Do NOT modify /DEVELOPER-NOTES.md if present (developer-owned).
- Use placeholders only, never real secrets.
- Push after every commit (Git Rules in /ai/AI_RULES.md).
- The template stack is the default. Product differentiation comes from
  routes, schemas, and UI — not from re-litigating architectural decisions.

Begin with the Start-of-Chat summary (START_HERE.md section 5).
End with the End-of-Chat report (START_HERE.md section 6) — and update
CURRENT_STATE, TASKS, HANDOFF, DONE_LOG before ending work.
```
