# Tasks

Last Updated: 2026-05-09

Phase 0 tasks are queued and ready for execution. **P0-T7** is Active.
CHAT_END (2026-05-09): Landed `origin/main` `53f1a4e`; P0-T7 Active; `.github/workflows/ci.yml` not created yet.
Phase 1–8 placeholders are in Backlog; each will be decomposed when its phase becomes active.

---

## Human pairing vs unattended harness

The autonomous harnesses (`run-phase.sh`, `run-phase-cursor.sh`) consult this matrix
to decide whether to execute a task fully, partially, or stop and ask for a human.

| Task ID | Unattended | What the human must do (if any) |
|---------|------------|----------------------------------|
| P0-T1   | Yes        | —                                |
| P0-T2   | Yes        | —                                |
| P0-T3   | Yes        | —                                |
| P0-T4   | Yes        | —                                |
| P0-T5   | Yes        | —                                |
| P0-T6   | Yes        | —                                |
| P0-T7   | Yes        | —                                |
| P0-T8   | Yes        | —                                |

Definitions:
- **Yes**: Fully automatable. Harness proceeds, claims Done on success.
- **Partial**: Some parts are automatable, some require human action (real secrets,
  cloud setup, DNS, real third-party account creation). Harness implements the
  automatable parts only and lists remaining human steps in HANDOFF.md before
  marking Done.
- **No**: Cannot proceed without a human. Harness must stop, document what the
  human must do, set HANDOFF to Blocked, and NOT claim Done. Live secrets must
  never be entered from the harness.

### Per-phase profile estimates (Phases 1–8)

Rough unattended profiles — refine when each phase becomes active.

| Phase | Likely Unattended profile | Notes                                                                  |
|-------|---------------------------|------------------------------------------------------------------------|
| P1    | Yes                       | Shared packages, no external deps                                      |
| P2    | Yes                       | API skeleton, no real auth or DB yet                                   |
| P3    | Partial                   | Clerk SDK wiring is automatable; real Clerk account/creds = human      |
| P4    | Partial                   | Worker + Postmark client is automatable; real Postmark token = human   |
| P5    | Yes                       | Marketing site is static, no external service deps                     |
| P6    | Partial                   | Terraform code is automatable; Azure subscription / federation = human |
| P7    | Yes                       | Docs and runbooks are automatable                                      |
| P8    | Partial                   | Smoke tests automatable; real-account E2E demo = human                 |

---

### P0-T1: Initialize the monorepo skeleton — Done; see DONE_LOG.md.

### P0-T2: Add shared TypeScript config package — Done; see DONE_LOG.md.

### P0-T3: Add shared ESLint config package — Done; see DONE_LOG.md.

### P0-T4: Add docker-compose.yml for local dev supporting services — Done; see DONE_LOG.md.

### P0-T5: Add .env.example — Done; see DONE_LOG.md.

### P0-T6: Add scripts/setup.sh and scripts/setup.ps1 — Done; see DONE_LOG.md.

---

## Active Task

### P0-T7: Add CI workflow scaffolding

Status: Active
Owner: AI CLI (unattended)
Priority: High
Unattended: Yes

### Goal

Scaffold the GitHub Actions CI pipeline that enforces all code quality, security,
and supply-chain gates on every push and pull request. The initial run may produce
trivial output for lint and test (no app code yet), but must be green.

### Scope Included

- `.github/workflows/ci.yml` — 9 jobs:
  1. `install` — pnpm install with pnpm store cache
  2. `lint` — `pnpm lint` (ESLint)
  3. `typecheck` — `pnpm typecheck` (`tsc --noEmit`)
  4. `test` — `pnpm test` (Vitest)
  5. `dep-audit` — `pnpm audit --audit-level=high` (blocks on high/critical)
  6. `gitleaks` — secret scanning via `gitleaks/gitleaks-action`
  7. `semgrep` — SAST via `returntocorp/semgrep-action`
  8. `codeql` — GitHub CodeQL analysis
  9. `sbom` — CycloneDX SBOM generation, uploaded as build artifact
- Triggers: `push` (all branches) and `pull_request`
- `.github/dependabot.yml` — weekly updates for `npm` (pnpm compat) and `github-actions`

### Scope Excluded

- Deploy workflows (`deploy-staging.yml`, `deploy-prod.yml`) — Phase 6
- `CODEOWNERS` file — Phase 7 (docs pass)
- Actual passing test suite (apps scaffolded in Phases 2–5)

### Files Likely Involved

- `.github/workflows/ci.yml` (create)
- `.github/dependabot.yml` (create)

### Acceptance Criteria

- `ci.yml` is valid GitHub Actions YAML
- All 9 jobs defined with correct job IDs and `needs:` dependencies
- `dep-audit` step fails build on `high` or `critical` CVEs
- `gitleaks` uses the official action with a non-placeholder config
- SBOM artifact uploaded as `sbom-*.json` per build
- `dependabot.yml` covers both `npm` and `github-actions` ecosystems
- Action versions pinned to specific SHA (not floating tag)
- `permissions:` block at job level (least privilege)

### Test Requirements

- `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"` exits 0
- Manual: push to a branch; confirm CI run is green

### Security Considerations

- No secrets hardcoded in workflow YAML — use `${{ secrets.* }}` references only
- Action versions pinned to commit SHA, not floating tag (supply-chain integrity)
- `permissions: contents: read` or narrower at job level; escalate only where required
- CodeQL analysis must include `javascript` and `typescript` language targets

### Dev Environment Constraints

- All work runs natively in WSL Ubuntu (`~/repos/fortress-template`).
- No Docker for application processes.
- No `/mnt/c` paths in code or scripts.

### Handoff Notes

- Depends on P0-T1 (pnpm workspace required; otherwise `pnpm install` in CI fails).
- Depends on P0-T2 and P0-T3 (lint and typecheck reference these packages).

### Verification Step

`python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"` exits 0.

---

## Ready

### P0-T8: Add .well-known/security.txt, AGENTS.md, and PROJECT_STATUS.md

Status: Ready
Owner: AI CLI (unattended)
Priority: Medium
Unattended: Yes

### Goal

Add three required disclosure/documentation files: `security.txt` for vulnerability
disclosure, `AGENTS.md` for AI agent layer rules, and `PROJECT_STATUS.md` as a
living template-state document.

### Scope Included

- `.well-known/security.txt` — fields: `Contact:`, `Policy:`, `Preferred-Languages:`,
  `Expires:` (placeholder date 1 year after scaffold); all are clearly marked as
  placeholders requiring fork-specific values
- `AGENTS.md` — AI agent layer rules per `NEW_TEMPLATE_PROMPT.md`:
  - Web layer never touches database directly
  - API is sole owner of DB access and business rules
  - SDK (`@fortress/sdk`) is the typed contract between web and API
  - Worker processes async jobs; no user-facing HTTP responses
  - No business logic in shared packages (`types`, `crypto`, `auth-core`, etc.)
  - All 10 locked decisions listed as non-negotiable constraints
  - Instructions for follow-up AI passes on forks of this template
- `PROJECT_STATUS.md` — current scaffold state:
  - Phase 0 in progress; Phases 1–8 listed as TODO with spec section pointers
  - Every locked decision listed and marked implemented/pending
  - `REFRESH_PROMPT.md` rewrite flagged as a known pending item

### Scope Excluded

- `docs/` directory and runbooks (Phase 7)
- `CLAUDE.md` (spec repo layout includes it; do not create or overwrite here)
- `README.md` (updated in Stage 1)

### Files Likely Involved

- `.well-known/security.txt` (create)
- `AGENTS.md` (create)
- `PROJECT_STATUS.md` (create)

### Acceptance Criteria

- `security.txt` contains all four required fields
- `AGENTS.md` lists all 10 non-negotiables and all layer responsibilities
- `PROJECT_STATUS.md` lists every stubbed item with a TODO and a doc link
- `REFRESH_PROMPT.md` rewrite is flagged in `PROJECT_STATUS.md`
- "Secrets never live in code or repo" is explicitly stated in `AGENTS.md`

### Test Requirements

- Manual review of all three files

### Security Considerations

- `security.txt` `Contact:` must use a placeholder email, not a real address
- `AGENTS.md` must explicitly state "secrets never live in code or repo" as a
  non-negotiable constraint for any AI agent working on a fork

### Dev Environment Constraints

- All work runs natively in WSL Ubuntu (`~/repos/fortress-template`).
- No Docker for application processes.
- No `/mnt/c` paths in code or scripts.

### Handoff Notes

- This task is independent and can run in parallel with P0-T2 through P0-T7.
- After P0-T8 is complete, Phase 0 is done. Proceed to Phase 1.

### Verification Step

`test -f .well-known/security.txt && test -f AGENTS.md && test -f PROJECT_STATUS.md && echo "P0-T8 OK"` exits 0.

---

## Backlog

Phase 1–8 placeholders. Each will be decomposed into atomic tasks when its phase becomes active.
See `/ai/reference/NEW_TEMPLATE_PROMPT.md` for the authoritative scope of each phase.

**P1 — Shared packages**: Create `packages/sdk`, `packages/types`, `packages/ui`,
`packages/crypto`, `packages/auth-core`, `packages/observability`, `packages/testing`.
Each package: source, exports, smoke tests, README. Estimated ~8 tasks.

**P2 — API skeleton**: Scaffold `apps/api` (NestJS 11) with env validation, security
middleware chain (headers → rate limit → Zod validation → logging → exception filter),
health endpoint, audit log table + Drizzle schema, server-side session/audit record
service. No business modules yet. Estimated ~6 tasks.

**P3 — Web skeleton**: Scaffold `apps/web` (Next.js 16 App Router) with Clerk
integration, root layout, protected route group, Clerk session → API call via
`@fortress/sdk` → display "hello, [name]". Estimated ~5 tasks.

**P4 — Worker skeleton**: Scaffold `apps/worker` (BullMQ consumer) with one example
idempotent job (welcome email via Postmark). Retry/backoff, dead-letter queue,
Postmark webhook signature verification. Estimated ~4 tasks.

**P5 — Marketing site**: Scaffold `apps/marketing` (Astro) with hardened CSP,
privacy-respecting analytics (Plausible), `security.txt` link, cookie consent banner.
Lighthouse 95+ on performance and security headers. Estimated ~4 tasks.

**P6 — Infrastructure**: Terraform Azure module set (primary) + AWS module set (parallel
swap). Container Apps, Postgres Flexible, Redis, Blob, Key Vault, Front Door, DNS.
Both `terraform plan -var-file=dev.tfvars` clean with no errors. Estimated ~6 tasks.

**P7 — Documentation**: `docs/architecture.md`, `docs/security.md` (STRIDE threat
model), `docs/runbooks/` (8 runbooks), `docs/compliance/`, `docs/legal/`, `docs/adrs/`.
All linked from `docs/index.md`. Estimated ~8 tasks.

**P8 — Acceptance**: End-to-end verification against all acceptance criteria in
`NEW_TEMPLATE_PROMPT.md`. Gap identification and fixing. Final `PROJECT_STATUS.md`
pass. Estimated ~4 tasks.

---

## Blocked

None

## Review

None

## Done

None
