# Kickoff Prompt — Fortress Template

> **One-time prompt.** Paste this into a fresh AI CLI session (Cursor CLI or Claude Code) running with the working directory set to `~/repos/fortress-template` inside WSL. After Phase 0 begins, this file becomes historical reference and the AI workflow is driven by `/ai/HANDOFF.md`.

---

## Your role

You are the **executor** in an architect/executor split. The architect (a separate Claude session) has already produced the spec and the planning skeleton. Your job is to:

1. Align the existing `/ai/` planning files with the spec (the planning files were carried over from a sister project and currently describe the wrong stack).
2. Produce a Phase 0 task breakdown plus a phase manifest so the human can run autonomous batches via `run-phase.sh` (or its Cursor-CLI variant).

You will **not** write any application code in this session. You will **not** install any dependencies. You will **not** scaffold the monorepo. Those happen in Phase 0 execution, which is a separate session.

This is a **TWO-STAGE** session. Complete Stage 1 fully, commit, push, stop, and wait for human approval before starting Stage 2.

---

## Source of truth

Read these files in order before doing anything else:

1. **`/ai/reference/NEW_TEMPLATE_PROMPT.md`** — the authoritative spec. Tech stack, locked decisions, security baseline, phase plan, acceptance criteria. When `/ai/` planning files conflict with this file, this file wins.
2. **`/ai/START_HERE.md`** — the AI workflow rules for this repo.
3. **`/ai/AI_RULES.md`** — non-negotiable hard rules. Especially the Git Rules (push after every commit) and Planning-File Hygiene rules (line caps, dating).
4. **`/ai/DEV_ENVIRONMENT.md`** — WSL-native conventions.
5. **`/ai/PROJECT.md`, `/ai/ARCHITECTURE.md`, `/ai/ROADMAP.md`, `/ai/TASKS.md`, `/ai/DECISIONS.md`, `/ai/TESTING.md`, `/ai/DEPLOYMENT.md`, `/ai/CURRENT_STATE.md`, `/ai/HANDOFF.md`** — current state of the planning files. **These currently describe a static-site starter (Astro + Azure SWA + Functions + Postmark + Turnstile contact form).** They will be substantially rewritten in Stage 1.
6. **`/ai/templates/INIT_PROMPT.md`, `/ai/templates/REFRESH_PROMPT.md`, `/ai/templates/CHAT_START_PROMPT.md`, `/ai/templates/CHAT_END_PROMPT.md`, `/ai/templates/HANDOFF.template.md`, `/ai/templates/CURRENT_STATE.template.md`, `/ai/templates/TASK_TEMPLATE.md`** — reusable patterns. Use `TASK_TEMPLATE.md` as the shape for new task entries; use `HANDOFF.template.md` and `CURRENT_STATE.template.md` as the shape for those compact files.
7. **`/README.md`** — currently the `ai-starter` README. Will be rewritten.
8. **`/run-phase.sh`** (and any Cursor-CLI variant alongside it, e.g., `run-phase-cursor.sh`) — the autonomous task-runner script(s). They expect well-formed task IDs in `/ai/TASKS.md` and use `/ai/HANDOFF.md` as the per-task pickup point. Treat these scripts as developer-owned: don't modify them except to fix actual bugs (and write an ADR if you do).
9. **`/ai/reference/LUCIDCHART_PROMPT.md`** — design artifact, no action required, just be aware it exists.

**DO NOT modify `/DEVELOPER-NOTES.md`.** It declares itself developer-owned at the top of the file.

---

## Important context

- This repo is the **template itself**, not an application. Forks of it become applications. So `/ai/` should describe the template, not a specific product.
- The 10 locked decisions in `NEW_TEMPLATE_PROMPT.md` override every conflicting baked-in ADR.
- Some existing ADRs survive (ADR-001 WSL-native dev, ADR-003 Tailwind 4 via Vite plugin, ADR-004 pnpm only, ADR-006 OIDC federated GitHub Actions, ADR-008 TypeScript strict + ESM, ADR-009 Vitest, ADR-010 CI on push/PR).
- Some are superseded by the locked decisions (ADR-002 Astro-only, ADR-005 Azure SWA + Functions, ADR-007 Postmark + Turnstile contact form pattern).

---

## STAGE 1 — Realign `/ai/` planning files

### Hard rules for Stage 1

- No application code. Only planning/documentation files.
- No `pnpm install`, no `pnpm create`, no scaffolding.
- No real secrets — placeholders only.
- Don't touch `/DEVELOPER-NOTES.md`.
- Don't touch `/run-phase.sh` or its Cursor variant.
- Don't touch `/ai/START_HERE.md` (workflow doc, no stack-specific content — it stays).
- Add `Last Updated: <today's UTC date>` to the top of every planning file you change.
- Push after every successful commit (per `/ai/AI_RULES.md` Git Rules).

### Files to rewrite

For each file, follow the per-file instructions. Use `NEW_TEMPLATE_PROMPT.md` as the source for content. Preserve the existing file structure (headings, sections) where possible — change the content under the headings, not the headings themselves, unless the spec calls for new sections.

#### `/README.md` (root) — full rewrite

Replace the `ai-starter` description with a fortress-template description.

Sections to include:
- One-paragraph project description (forkable, security-first, production-grade SaaS chassis).
- Repository status: this is the template itself, not an application. Forks become applications.
- How to use: clone or "Use this template" → run the kickoff prompt → realign → execute Phase 0 onward.
- What's baked in: enumerate the 10 locked decisions.
- What's NOT baked in: real Clerk creds, real Stripe products, domain, mobile apps, multi-tenant scaffolding (deferred to runbook).
- Single rule: read `/ai/START_HERE.md` first.
- Refresh process pointer to `/ai/templates/REFRESH_PROMPT.md` (which itself will need a Fortress-aware rewrite later — flag in `PROJECT_STATUS.md` but don't do it now).

#### `/ai/PROJECT.md` — replace stack and project identity

- Project Name: `Fortress Template`
- Application Description: forkable, security-first, production-grade SaaS chassis for consumer-facing B2C single-tenant apps.
- Problem Being Solved: starting a new SaaS means re-litigating dozens of architectural and security decisions; this template makes those decisions once.
- Target Users: Tommy (and any future contributors) building consumer SaaS on this stack.
- Primary Goals: ship the chassis described in `/ai/reference/NEW_TEMPLATE_PROMPT.md` so a fork + AI scaffolding pass can produce a real application without touching architecture.
- Explicit Non-Goals: business logic, real product features, mobile apps, multi-tenant scaffolding, ML/AI features.
- **Replace the entire "Default Tech Stack" section** with the Fortress stack table from `NEW_TEMPLATE_PROMPT.md` (Next.js 16 / NestJS 11 / Drizzle / Postgres 18 / Redis 8 / Clerk / Tailwind 4 / Vitest 4 + supertest + Playwright / ESLint 10 / Prettier 3 / Pino / OpenTelemetry → Tempo / Sentry / Postmark / Azure Blob Storage / Stripe / Unleash / pnpm 10 / Turbo 2 / Azure Container Apps / Terraform / Azure Key Vault).
- **Replace the Repository Structure section** with the monorepo layout from `NEW_TEMPLATE_PROMPT.md`.
- **Non-Negotiables section**: copy the 10 invariants from `NEW_TEMPLATE_PROMPT.md` "Non-negotiables" section.
- AI Instructions section: keep the "preserve cross-project files" pattern, but update the "default tech stack" reference to point at the Fortress stack.

#### `/ai/ARCHITECTURE.md` — full rewrite

- System Overview: replace the contact-form static-site diagram with the Fortress 3-subdomain architecture (marketing on Astro / web on Next.js / api on NestJS / worker on BullMQ / data tier in private subnet with Postgres / Redis / Blob / identity via Clerk / observability via Sentry + Tempo / integrations Postmark + Stripe / edge via Azure Front Door).
- Major Components: `apps/marketing`, `apps/web`, `apps/api`, `apps/worker`, plus the `packages/*` and `infra/terraform/*` layout.
- Data Flow: signup → Clerk authenticates → web calls API with Clerk JWT → API verifies via JWKS → API creates server-side audit/session record → API enforces middleware chain → Drizzle queries Postgres → BullMQ jobs via Redis → worker emits emails via Postmark → audit log appended → tracing flows web → api → worker → db via OpenTelemetry.
- Security Model: copy the "Security baseline" section from `NEW_TEMPLATE_PROMPT.md`.
- External Services table: Clerk, Postmark, Stripe, Sentry, Grafana Tempo, Azure (Front Door, Container Apps, Postgres Flexible, Cache for Redis, Blob, Key Vault, Monitor, DNS, Static Web Apps for marketing).
- Architecture Rules: the 10 non-negotiables from `NEW_TEMPLATE_PROMPT.md`.

#### `/ai/ROADMAP.md` — replace 5-phase plan with Fortress 9-phase plan

Use the phase table from `NEW_TEMPLATE_PROMPT.md` "Phase plan (mandatory)" section. Phases 0 through 8. For each phase: title, scope, verification step, status. Phase 0 is `Ready`; Phases 1–8 are `Backlog`.

#### `/ai/TASKS.md` — clear and reset

Remove the existing tasks (P0-T1 init, P1-T1 scaffold Astro, P1-T2 CI, P1-T3 README — all static-site-specific). Stage 1 leaves TASKS.md mostly empty:
- Active Task: None
- Ready: empty (Stage 2 populates Phase 0 tasks)
- Backlog: empty
- Blocked: None
- Review: None
- Done: empty

Add a one-line note at the top: `Phase 0 tasks are populated by Stage 2 of the kickoff prompt. See /ai/HANDOFF.md.`

#### `/ai/DECISIONS.md` — keep what's portable, supersede the rest, add new ADRs

**Keep as Accepted (light edits only if needed for clarity):**
- ADR-001 (WSL-native dev, no Docker for app code) — **add a carve-out**: this template uses `docker-compose up` to host supporting services for local dev (Postgres, Redis, mailpit, Azurite, Unleash). Apps still run as native Node processes via `pnpm dev` orchestrated by Turbo. The original principle (no Docker for the *application*) holds.
- ADR-003 (Tailwind 4 via the Vite plugin) — still valid for marketing and web.
- ADR-004 (pnpm only) — still valid.
- ADR-006 (GitHub Actions OIDC federated auth) — still valid for Azure deployments generally.
- ADR-008 (TypeScript strict + ESM + ES2022) — still valid. Note: `NEW_TEMPLATE_PROMPT.md` lists ES2023 in some places. Pick the higher target (ES2023) and update the ADR.
- ADR-009 (Vitest 3+) — still valid; extend to mention supertest (API e2e) and Playwright (web smoke) also used.
- ADR-010 (CI on push and pull_request, not workflow_dispatch) — still valid.

**Supersede (mark Status: Superseded by ADR-NNN, do NOT delete the original):**
- ADR-002 (Astro 5 + React 19 islands) — superseded. Astro is still used for the marketing site, but the web app uses Next.js 16 App Router. Write a new ADR clarifying the split.
- ADR-005 (Azure SWA with managed Functions) — superseded. Fortress uses Azure Container Apps for `api` and `worker`, Azure Static Web Apps for `marketing`, and Container Apps for `web` (SSR required). Write a new ADR.
- ADR-007 (Postmark + Turnstile + honeypot + rate limiting for contact form) — superseded. Postmark stays (transactional email). Turnstile + honeypot + contact-form pattern doesn't apply to a SaaS chassis; bot/abuse mitigation moves to Cloudflare/Front Door WAF + per-route rate limiting in the API middleware chain. Write a new ADR.

**Add new ADRs (start at ADR-011)** corresponding to the 10 locked decisions:
- ADR-011: Clerk as identity provider (B2C consumer apps; Stytch documented as swap)
- ADR-012: Drizzle as ORM (no codegen, AI-scaffolder-friendly)
- ADR-013: Azure as primary cloud, AWS as parallel module
- ADR-014: SOC 2 + GDPR-friendly compliance baseline; HIPAA / PCI as explicit add-ons
- ADR-015: Single-tenant by default; multi-tenant upgrade documented as a runbook, not auto-migration
- ADR-016: Astro for the marketing site on a separate subdomain (cookie/CSP/analytics isolation)
- ADR-017: Postmark for transactional email (Resend documented as swap)
- ADR-018: Unleash self-hosted + OpenFeature SDK for feature flags (open standard, no vendor lock)
- ADR-019: Sentry for error tracking with PII scrubbing on by default
- ADR-020: Grafana Tempo via OTLP for tracing; Azure Monitor as log/metric sink

**Add ADR-021**: Server-side opaque audit/session record on the API even though Clerk owns the user-facing session. Document the rationale (revocation, audit, step-up control) and the tradeoff (Clerk owns more session UX than the strict "we own everything" rule implies; relaxed for B2C DX).

**Add ADR-022**: Two-stage kickoff session pattern (this prompt) is the canonical way to bootstrap this template into a usable state. Stage 1 = realign `/ai/` files. Stage 2 = produce Phase 0 task breakdown + phase manifest. Each subsequent phase is its own AI session, gated by human approval.

For each new ADR, fill: Decision, Reason, Tradeoffs, Related Tasks (point at upcoming Phase 0 tasks where applicable, otherwise "see `/ai/reference/NEW_TEMPLATE_PROMPT.md`").

#### `/ai/TESTING.md` — replace with Fortress testing strategy

- **Unit tests**: Vitest 4. Required for every `packages/*` and for `apps/*/src/lib/*` business logic. Target ≥ 80% line coverage.
- **Integration tests**: supertest against NestJS modules. Drizzle tests use either testcontainers or the docker-compose-managed test database.
- **E2E tests**: Playwright for web smoke. Cover the sign-up via Clerk dev mode → land in app → sign out happy path.
- **Security tests**: rate limit (auth and general tiers), CSRF double-submit verification, security headers present, signature verification on inbound webhooks (Clerk, Stripe, Postmark).
- **Mock strategy**: Clerk JWKS, Postmark, Stripe, Sentry, etc., all mocked at module boundary in unit tests.
- **CI gates**: lint + typecheck + test + audit + gitleaks + semgrep + codeql + SBOM + Docker build.
- **Test commands**: `pnpm test`, `pnpm test:watch`, `pnpm test:e2e`.

#### `/ai/DEPLOYMENT.md` — replace with Fortress deployment story

- **Local dev**: `docker-compose up -d` boots supporting services (Postgres, Redis, mailpit, Azurite, Unleash). Apps run native via `pnpm dev` (Turbo).
- **Staging**: Azure Container Apps (api + worker) + Azure Front Door + Postgres Flexible + Cache for Redis + Blob + Key Vault + Static Web Apps (marketing). Auto-deploy on merge to `main`.
- **Production**: same shape in a different Azure subscription. Manual approval gate for prod deploys; smoke tests post-deploy; automated rollback on health check failure.
- **CI/CD**: GitHub Actions with OIDC federated auth. Both Azure (default) and AWS modules supported.
- **Secrets**: Azure Key Vault (Azure module) / AWS Secrets Manager (AWS module). Local: generated `.env` files with strong randoms via `scripts/setup.{sh,ps1}`.
- **Required Environment Variables**: enumerate every var from `NEW_TEMPLATE_PROMPT.md` — Clerk (publishable key, secret key, webhook secret), Postmark (API token, from-email, server tokens for streams), Stripe (secret key, publishable key, webhook secret), Sentry DSN, OTLP endpoint, database URL, Redis URL, encryption key (base64 AES-256-GCM), CSP report URI, Unleash URL/token, etc.
- **Migrations**: Drizzle migrations, forward-only, run in a pre-deploy job, not at app startup.
- **Rollback**: Azure Container Apps revision rollback (Azure module) / ECS rolling update reversion (AWS module).
- **Initial Azure setup**: federated credential per repo, Container Apps environment, etc. — list as one-time setup steps to be done outside the AI workflow.

#### `/ai/CURRENT_STATE.md` — reset for Fortress (≤ 80 lines)

- Current Phase: Stage 1 of kickoff complete (planning realignment); Phase 0 not yet started.
- Current Task: None. Awaiting human approval to run Stage 2.
- What Exists Now: `/ai/` planning files realigned to Fortress. No application code. No `package.json`. No infra applied.
- What Works: AI workflow ready. `run-phase.sh` (and Cursor variant) present and ready to drive Phase 0 tasks once they're queued.
- What Is Not Built Yet: literally everything in `NEW_TEMPLATE_PROMPT.md` acceptance criteria.
- Known Problems: None.
- Important Files or Folders: `/ai/reference/NEW_TEMPLATE_PROMPT.md` (spec), `/KICKOFF_PROMPT.md` (this file), the standard `/ai/*.md` set.
- Next Recommended Action: human approval → run Stage 2.

#### `/ai/HANDOFF.md` — reset for Fortress (≤ 50 lines)

- One-paragraph summary: Stage 1 of the Fortress Template kickoff completed. `/ai/` planning files realigned away from the static-site starter and toward the Fortress SaaS chassis. Awaiting human approval to run Stage 2 (Phase 0 task breakdown + phase manifest).
- Pickup instruction for the next session: read `/ai/reference/NEW_TEMPLATE_PROMPT.md`, `/KICKOFF_PROMPT.md`, and `/ai/CURRENT_STATE.md`. Then proceed to the Stage 2 instructions in `KICKOFF_PROMPT.md`.
- Live blockers: none.
- Don't do: don't begin Phase 0 execution until Stage 2 has produced a written task breakdown and a human has approved it.

#### `/ai/AI_RULES.md` — minimal carve-out

Under the "Development Environment Rules (Hard)" section, **add a single sub-bullet**:

> For this template repo (`fortress-template`), `docker-compose up -d` is the canonical local-dev boot for supporting services (Postgres, Redis, mailpit, Azurite, Unleash). Apps still run as native Node processes via `pnpm dev` orchestrated by Turbo. Do NOT run apps inside containers locally.

Leave everything else alone.

#### `/ai/DEV_ENVIRONMENT.md` — minor update

Update the "Database services" section to note that this template uses a `docker-compose.yml` at the repo root to host the full set of supporting services (Postgres, Redis, mailpit, Azurite, Unleash) for local dev — distinct from the per-engine shared-container pattern documented for one-off projects. Apps still run native.

Leave everything else alone.

#### `/ai/templates/INIT_PROMPT.md` — rewrite for forks of fortress-template

The existing INIT_PROMPT is for forks of `ai-starter`. Rewrite it to be the prompt that initializes a fork of `fortress-template`:

- The fork is a new application repo cloned from `fortress-template`.
- The new project has its own product identity (not "Fortress Template" generically).
- The locked decisions are inherited; per-product overrides require ADRs.
- The fork's `/ai/PROJECT.md` gets product-specific name, description, target users, goals, non-goals — but the tech stack stays as defined unless a product-specific ADR overrides it.
- The fork's first implementation tasks are about wiring product-specific routes, schemas, and UI on top of the inherited chassis — NOT re-scaffolding the chassis.

Use the structure of the existing `INIT_PROMPT.md` (Bootstrap checklist, numbered Steps, Hard rules) as the shape; replace the content.

### Stage 1 deliverable

When Stage 1 is complete, produce the following status report and stop:

```text
STAGE 1 COMPLETE — Planning realignment

Files rewritten:
  - /README.md
  - /ai/PROJECT.md
  - /ai/ARCHITECTURE.md
  - /ai/ROADMAP.md
  - /ai/TASKS.md
  - /ai/DECISIONS.md
  - /ai/TESTING.md
  - /ai/DEPLOYMENT.md
  - /ai/CURRENT_STATE.md
  - /ai/HANDOFF.md
  - /ai/AI_RULES.md (carve-out only)
  - /ai/DEV_ENVIRONMENT.md (carve-out only)
  - /ai/templates/INIT_PROMPT.md

Files preserved (not modified):
  - /DEVELOPER-NOTES.md
  - /run-phase.sh and any Cursor-CLI variant
  - /ai/START_HERE.md
  - /ai/DONE_LOG.md
  - /ai/templates/REFRESH_PROMPT.md, CHAT_START_PROMPT.md, CHAT_END_PROMPT.md, HANDOFF.template.md, CURRENT_STATE.template.md, TASK_TEMPLATE.md
  - /ai/reference/NEW_TEMPLATE_PROMPT.md, LUCIDCHART_PROMPT.md, PROMPT_LIBRARY.md

ADR changes:
  - Kept (with light edits if noted): ADR-001 (carve-out), ADR-003, ADR-004, ADR-006, ADR-008 (target → ES2023), ADR-009 (extended), ADR-010
  - Superseded: ADR-002, ADR-005, ADR-007
  - Added: ADR-011 through ADR-022

Open questions or deviations from spec:
  <list any places you deviated, why, and what tradeoff you accepted>

Next step: human review of the realignment. When approved, paste this same kickoff prompt into a fresh session (or reply "approve Stage 1, run Stage 2" in this session) to proceed to Stage 2.

Do NOT proceed to Stage 2 without explicit human approval.
```

Commit your changes (one commit, or a small number of related commits — your call) with clear messages, push, and stop.

---

## STAGE 2 — Plan Phase 0 (only after Stage 1 is approved)

### Hard rules for Stage 2

Same as Stage 1: no application code, no installs, no scaffolding. This stage is planning only.

### What to do

Per `/ai/reference/NEW_TEMPLATE_PROMPT.md`, Phase 0 is:

> Repo skeleton, monorepo tooling (pnpm, Turbo, tsconfig, eslint), CI workflow scaffolding, `.env.example`, `security.txt`, `AGENTS.md`, `PROJECT_STATUS.md`. Verification: `pnpm install`, `pnpm typecheck`, `pnpm lint` all pass; CI runs green on the initial commit.

Decompose Phase 0 into atomic tasks sized for one focused AI session each. The architect's suggested decomposition is below — refine if you find better edges, but if you change task boundaries, document the rationale in the deliverable.

**Suggested Phase 0 task decomposition (8 tasks):**

1. **P0-T1: Initialize the monorepo skeleton.** `pnpm-workspace.yaml`, `turbo.json`, root `package.json` with workspace scripts (`dev`, `build`, `lint`, `typecheck`, `test`, `clean`, `setup`), `.gitignore`, `.nvmrc` or `.node-version` pinning Node 24 LTS, `.editorconfig`, `.prettierrc`. Pin `pnpm` via `packageManager` field. No apps yet, no packages yet.
2. **P0-T2: Add shared TypeScript config package** (`packages/config-typescript`). Bases: `base.json`, `next.json`, `node.json`, `library.json`. Strict mode, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, ES2023 target. Smoke test: another package can extend each base and `tsc --noEmit` passes.
3. **P0-T3: Add shared ESLint config package** (`packages/config-eslint`). Configs: `base.js`, `next.js`, `node.js`. Type-checked rules, no-floating-promises, consistent-type-imports. Smoke test: applied to itself; `eslint .` passes.
4. **P0-T4: Add `docker-compose.yml`** at the repo root with services: Postgres 18, Redis 8, mailpit (SMTP testing), Azurite (Blob testing), Unleash (feature flags). Verify `docker-compose up -d` boots all services cleanly and they're reachable on documented ports.
5. **P0-T5: Add `.env.example`** with every required environment variable from `/ai/DEPLOYMENT.md`. Each var has a comment explaining what it's for and where to source it. Use `replace-with-*` placeholders for required-but-not-yet-set values.
6. **P0-T6: Add `scripts/setup.sh` and `scripts/setup.ps1`.** Both: generate `.env` files with strong randoms, run `docker-compose up -d`, print next steps. Scripts must be idempotent (re-runnable without breaking state) and refuse to overwrite existing `.env` without `--force`.
7. **P0-T7: Add CI workflow scaffolding** at `.github/workflows/ci.yml`. Jobs: install (with pnpm cache), lint, typecheck, test, dep-audit, gitleaks, semgrep, codeql, SBOM (CycloneDX). Initial run can be no-op-passing until apps are added — the goal is the workflow exists and is green on the first commit. Triggers: `push` and `pull_request`. Dependabot config at `.github/dependabot.yml`.
8. **P0-T8: Add `/.well-known/security.txt`, `/AGENTS.md`, `/PROJECT_STATUS.md`.**
   - `security.txt`: vulnerability disclosure, contact, policy URL.
   - `AGENTS.md`: layer rules (web never touches DB; API is sole DB owner; SDK is the contract; etc.) per `NEW_TEMPLATE_PROMPT.md`.
   - `PROJECT_STATUS.md`: initial state — chassis being scaffolded, every stub tagged with a TODO and a doc link, every locked decision listed.

For each task, write a TASKS.md entry using `/ai/templates/TASK_TEMPLATE.md` as the shape. Each entry must include:
- Task ID (P0-T1, P0-T2, etc.)
- Status (first task: `Active`; rest: `Ready`)
- Owner (the AI CLI that will execute)
- Priority
- **Unattended: Yes / No / Partial** (see "Human pairing vs unattended harness" section requirement below)
- Goal
- Scope Included (concrete files to create or modify)
- Scope Excluded (explicit non-goals)
- Acceptance Criteria (concrete, verifiable)
- Test Requirements
- Verification step (literal command — what does "done" look like, e.g., `pnpm typecheck` exit 0)

### "Human pairing vs unattended harness" matrix (required section in TASKS.md)

The Cursor CLI harness (`run-phase-cursor.sh`) reads a section in `/ai/TASKS.md` titled **"Human pairing vs unattended harness"**. This section is a task matrix that tells the harness when to proceed autonomously and when to stop and wait for a human.

Add this section to `/ai/TASKS.md`. Format:

```markdown
## Human pairing vs unattended harness

The autonomous harnesses (`run-phase.sh`, `run-phase-cursor.sh`) consult this matrix
to decide whether to execute a task fully, partially, or stop and ask for a human.

| Task ID | Unattended | What the human must do (if any)                       |
|---------|------------|-------------------------------------------------------|
| P0-T1   | Yes        | —                                                     |
| P0-T2   | Yes        | —                                                     |
| ...     | ...        | ...                                                   |

Definitions:
- **Yes**: Fully automatable. Harness proceeds, claims Done on success.
- **Partial**: Some parts are automatable, some require human action (real secrets,
  cloud setup, DNS, real third-party account creation). Harness implements the
  automatable parts only and lists remaining human steps in HANDOFF.md before
  marking Done.
- **No**: Cannot proceed without a human. Harness must stop, document what the
  human must do, set HANDOFF to Blocked, and NOT claim Done. Live secrets must
  never be entered from the harness.
```

For Phase 0 tasks specifically, all 8 are expected to be `Unattended: Yes` (they're tooling, configs, and scaffolding scripts — no real secrets, no cloud setup). If you decompose Phase 0 differently and any task crosses into Partial or No, document what the human must do in the matrix.

Also add a one-line entry per Phase 1–8 placeholder showing the rough Unattended profile so the human knows roughly which phases will need pairing:

```markdown
| Phase | Likely Unattended profile | Notes                                                                 |
|-------|---------------------------|-----------------------------------------------------------------------|
| P1    | Yes                       | Shared packages, no external deps                                     |
| P2    | Yes                       | API skeleton, no real auth or DB yet                                  |
| P3    | Partial                   | Clerk SDK wiring is automatable; real Clerk account/creds = human     |
| P4    | Partial                   | Worker + Postmark client is automatable; real Postmark token = human  |
| P5    | Yes                       | Marketing site is static, no external service deps                    |
| P6    | Partial                   | Terraform code is automatable; Azure subscription / federation = human|
| P7    | Yes                       | Docs and runbooks are automatable                                     |
| P8    | Partial                   | Smoke tests automatable; real-account E2E demo = human                |
```

These per-phase profiles are estimates; refine when each phase becomes active.

### Stage 2 deliverables

1. **`/ai/TASKS.md`** updated with:
   - P0-T1 through P0-T8 (or your refined breakdown). First task `Active`; rest `Ready`. Each task includes the `Unattended` flag.
   - Backlog populated with high-level Phase 1–8 placeholders (one line each per phase, pointing at the phase scope from `NEW_TEMPLATE_PROMPT.md`).
   - The **"Human pairing vs unattended harness"** matrix section, populated for all Phase 0 tasks plus the per-phase profile estimates for Phases 1–8 (per the template above).
2. **`/ai/HANDOFF.md`** updated to point at the first Phase 0 task as the next pickup.
3. **`/ai/CURRENT_STATE.md`** updated to reflect Phase 0 is `Ready`, first task is `Active`, no execution has happened yet.
4. **`/PHASE_MANIFEST.md`** at the repo root — human-readable. Markdown table with columns:

   | Phase | Title | Tasks | Run command | Verification | Status |

   Populate all 9 phases. Phase 0: actual task count from your decomposition. Phases 1–8: rough estimates based on `NEW_TEMPLATE_PROMPT.md` scope (you'll refine each when its turn comes). Run command column shows the bash invocation for `run-phase.sh` (e.g., `./run-phase.sh 8` for Phase 0 if you settle on 8 tasks). Status: P0 = Ready; rest = Backlog.

5. **`/phase-manifest.json`** at the repo root — machine-readable, for `run-phase.sh` (and its Cursor variant) to consume. Schema:

   ```json
   {
     "phases": [
       {
         "id": "P0",
         "title": "Repo skeleton",
         "task_count": 8,
         "task_ids": ["P0-T1", "P0-T2", "P0-T3", "P0-T4", "P0-T5", "P0-T6", "P0-T7", "P0-T8"],
         "verification": "pnpm install && pnpm typecheck && pnpm lint succeed; CI green on initial commit",
         "status": "Ready"
       },
       { "id": "P1", "title": "Shared packages", "task_count": null, "task_ids": [], "verification": "...", "status": "Backlog" },
       ...
     ]
   }
   ```

   For Phases 1–8, leave `task_count: null` and `task_ids: []` until each phase is decomposed. The run-phase scripts can read the active phase's `task_count` and use it directly.

### Stage 2 deliverable report

When Stage 2 is complete, produce this status report and stop:

```text
STAGE 2 COMPLETE — Phase 0 plan ready

Phase 0 task count: <N>
First task: P0-T1 — <title>
Estimated total tasks across all 9 phases: <total>

Files created or updated:
  - /ai/TASKS.md (Phase 0 tasks queued)
  - /ai/HANDOFF.md (points at P0-T1)
  - /ai/CURRENT_STATE.md (Phase 0 Ready)
  - /PHASE_MANIFEST.md (all 9 phases listed)
  - /phase-manifest.json (machine-readable)

To kick off Phase 0 execution:
  Option A — autonomous batch:
    ./run-phase.sh <Phase 0 task count>
  Option B — task-by-task interactive:
    Open a fresh AI CLI session, paste:
      "Read /ai/START_HERE.md and follow it. Then pick up P0-T1 per HANDOFF.md."

Do NOT begin Phase 0 execution from this session.
```

Commit, push, stop.

---

## Hard rules (apply to BOTH stages)

- **No application code.** No `pnpm install`, no `pnpm create`, no scaffolding. Both stages are planning only.
- **No real secrets, ever.** Placeholders only.
- **Don't touch `/DEVELOPER-NOTES.md`.**
- **Don't touch `/run-phase.sh` or its Cursor variant** unless you find an actual bug. If you do, write an ADR.
- **Don't touch `/ai/START_HERE.md`.** It's the workflow entry point and stays stack-agnostic.
- **Push after every successful commit.** If a push fails, stop and surface the error.
- **Stop between stages.** After Stage 1 deliverable is committed and pushed, stop and wait for human approval before starting Stage 2.
- **Date everything you touch.** `Last Updated: <today's UTC date>` at the top of every planning file you change.
- **State pickup, don't resume from memory.** When in doubt, re-read the source-of-truth files.

---

## Begin

1. Run the standard Start-of-Chat summary per `/ai/START_HERE.md` section 5.
2. Confirm you've read the source-of-truth files listed at the top of this prompt.
3. Confirm you understand this is a planning-only session (Stages 1 and 2; no code).
4. Begin Stage 1.

End each stage with the End-of-Chat report per `/ai/START_HERE.md` section 6, plus the stage-specific deliverable report defined above.
