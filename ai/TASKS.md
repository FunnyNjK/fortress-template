# Tasks

Last Updated: 2026-05-09

Phase 0 tasks are queued and ready for execution. **P0-T5** is Active.
CHAT_END (2026-05-09): active and ready tasks verified against repo.
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

---

## Active Task

### P0-T5: Add .env.example

Status: Active
Owner: AI CLI (unattended)
Priority: High
Unattended: Yes

### Goal

Create `.env.example` as the canonical source of truth for every environment variable
required by the Fortress stack. Every var has a comment with its purpose and where
to obtain the value. Secrets use `replace-with-*` placeholders; service URLs default
to `localhost` ports matching `docker-compose.yml`.

### Scope Included

- `.env.example` with sections for: App URLs, Clerk, Postmark, Stripe, Sentry,
  OTLP/Tempo, Database, Redis, Unleash, Encryption, CSP report URI, and miscellaneous
- Every variable from `/ai/DEPLOYMENT.md` "Required Environment Variables" section
- Comments: purpose + source (e.g., `# Clerk Dashboard → API Keys`)
- `replace-with-*` placeholders for all secrets and required external keys
- `localhost:*` defaults for all service URLs (matching `docker-compose.yml` ports)
- Warning comment at the top: DO NOT commit a populated `.env`

### Scope Excluded

- Actual secret values (never in `.env.example`)
- `.env` file generation (handled by `scripts/setup.sh` in P0-T6)
- App-level env validation schemas (scaffolded with apps in Phases 2–5)

### Files Likely Involved

- `.env.example` (create)

### Acceptance Criteria

- Every env var from `/ai/DEPLOYMENT.md` is present
- All secret vars use `replace-with-*` placeholder pattern
- All service URL defaults point at `localhost` with ports matching `docker-compose.yml`
- No real secrets or real-looking credentials present
- File is parseable by `dotenv` without error

### Test Requirements

- `grep -c "replace-with-" .env.example` returns a count ≥ 1
- Manual review: all `/ai/DEPLOYMENT.md` vars present

### Security Considerations

- This file IS committed to git — it must never contain real secrets
- All values must be obviously fake (e.g., `replace-with-clerk-secret-key`)
- Warning comment at top of file required

### Dev Environment Constraints

- All work runs natively in WSL Ubuntu (`~/repos/fortress-template`).
- No Docker for application processes.
- No `/mnt/c` paths in code or scripts.

### Handoff Notes

- Depends on P0-T4 (ports and service names must match `docker-compose.yml`).
- `scripts/setup.sh` and `scripts/setup.ps1` (P0-T6) read this file to generate `.env`.

### Verification Step

`grep -c "replace-with-" .env.example` returns ≥ 1.

---

## Ready

### P0-T6: Add scripts/setup.sh and scripts/setup.ps1

Status: Ready
Owner: AI CLI (unattended)
Priority: High
Unattended: Yes

### Goal

Provide idempotent setup scripts for both WSL/Linux (`setup.sh`) and Windows
PowerShell (`setup.ps1`) that generate `.env` with strong cryptographic randoms,
start Docker supporting services, and print next steps. Both scripts refuse to
overwrite an existing `.env` without `--force`.

### Scope Included

- `scripts/setup.sh` — bash script (WSL/Linux/macOS) that:
  - Reads `.env.example`, replaces every `replace-with-*` value with a 32-byte hex
    random (`openssl rand -hex 32`), writes to `.env`
  - Skips vars that already have non-placeholder values in `.env.example` (URL defaults, etc.)
  - Runs `docker-compose up -d`
  - Prints a "next steps" summary: `pnpm install`, then `pnpm dev`
  - Guards idempotency: if `.env` exists, prints warning and exits unless `--force`
- `scripts/setup.ps1` — PowerShell 7+ script with the same logic using
  `[System.Security.Cryptography.RandomNumberGenerator]` for entropy

### Scope Excluded

- Database migration or seeding (Phase 2+)
- `pnpm install` invocation (explicit separate step)
- Production secret generation (use Azure Key Vault / AWS Secrets Manager)

### Files Likely Involved

- `scripts/setup.sh` (create)
- `scripts/setup.ps1` (create)

### Acceptance Criteria

- `bash -n scripts/setup.sh` exits 0 (bash syntax valid)
- Running `setup.sh` on a clean checkout creates `.env` with no `replace-with-*`
  values remaining for secret vars
- Running a second time without `--force` does NOT overwrite `.env`
- Running with `--force` DOES overwrite `.env`
- Both scripts print generated-secret notification but NOT the secret values

### Test Requirements

- `bash -n scripts/setup.sh` exits 0 (syntax check)
- Manual smoke test (outside CI): run on clean checkout; `.env` created; Docker services start
- Second run without `--force` shows warning and exits cleanly

### Security Considerations

- Generated secrets must use 32-byte cryptographic entropy (256-bit)
- Scripts must NOT print generated secret values to stdout
- `--force` must require an explicit flag; not triggered by any env var
- Scripts must refuse to run if `NODE_ENV=production` is set

### Dev Environment Constraints

- `setup.sh` targets WSL Ubuntu; uses `openssl rand -hex 32` for secret generation.
- `setup.ps1` targets PowerShell 7+; uses `[System.Security.Cryptography.RandomNumberGenerator]`.
- No `/mnt/c` paths in code or scripts.

### Handoff Notes

- Depends on P0-T4 (`docker-compose.yml` must exist).
- Depends on P0-T5 (`.env.example` must exist to copy from).

### Verification Step

`bash -n scripts/setup.sh` exits 0.

---

### P0-T7: Add CI workflow scaffolding

Status: Ready
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
