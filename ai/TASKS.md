# Tasks

Last Updated: 2026-05-09

CHAT_END (2026-05-09): **`origin/main`** **`d21487a`** after **`git fetch`** (clean); Ritual **`CHAT_END_PROMPT.md`**; **`npx pnpm@10.33.4`** `lint` `typecheck` `test` `build`; **`pnpm audit --audit-level=high`** (**moderate: 1**); **`grep -c replace-with-`** **`.env.example`** (=28); **`TESTING.md`** (P2-T5 auth integration line). Next **`P2-T6`**.

Phase 0 is **complete** (P0-T1–P0-T8). **Phase 1** is **complete** (P1-T1–P1-T6): shared library
packages landed. Next: **Phase 2** (`apps/api` skeleton). Phase 2–8 remain in Backlog until decomposed.

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
| P1-T1   | Yes        | —                                |
| P1-T2   | Yes        | —                                |
| P1-T3   | Yes        | —                                |
| P1-T4   | Yes        | —                                |
| P1-T5   | Yes        | —                                |
| P1-T6   | Yes        | —                                |
| P2-T1   | Yes        | —                                |
| P2-T2   | Yes        | —                                |
| P2-T3   | Yes        | —                                |
| P2-T4   | Yes        | —                                |
| P2-T5   | Yes        | —                                |
| P2-T6   | Yes        | —                                |

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

### P0-T6: Add scripts/setup.sh — Done; see DONE_LOG.md. (`scripts/setup.ps1` was produced by the harness against the spec; removed in cleanup commit per ADR-026.)

---

### P0-T7: Add CI workflow scaffolding — Done; see DONE_LOG.md.

### P0-T8: Add .well-known/security.txt, AGENTS.md, PROJECT_STATUS.md — Done; see DONE_LOG.md.

---

### P1-T1: Add `packages/types` (pure TS boundary types) — Done; see DONE_LOG.md.

### P1-T2: Add `packages/crypto` (AES-GCM, HMAC, timing-safe helpers) — Done; see DONE_LOG.md.

### P1-T3: Add `packages/auth-core` (CSRF/session identifier helpers) — Done; see DONE_LOG.md.

### P1-T4: Add `packages/observability` (Pino baseline logger) — Done; see DONE_LOG.md.

### P1-T5: Add `packages/sdk` (Zod + `/auth/me` client) — Done; see DONE_LOG.md.

### P1-T6: Add `packages/testing` (fixtures for Vitest) — Done; see DONE_LOG.md.

---

## Active Task

**P2-T6** — Health endpoints + Phase 2 verification harness (`Unattended: Yes`). Depends on **`P2-T1`–`P2-T5`**.

---

### P2-T1: Scaffold `apps/api` (NestJS 11) with env validation — Done; see DONE_LOG.md.

### P2-T2: Wire Drizzle ORM + Postgres connection + users table — Done; see DONE_LOG.md.

### P2-T3: Add `audit_events` and `sessions` Drizzle schemas + migration — Done; see DONE_LOG.md.

---

### P2-T4: Build the security middleware chain — Done; see DONE_LOG.md.

---

### P2-T5: Server-side session/audit record service + JWKS verifier (stub) + CSRF — Done; see DONE_LOG.md.

---

### P2-T6: Health endpoints + Phase 2 verification harness
Status: Backlog
Owner: TBD
Priority: Medium

## Goal
Add operational health endpoints and consolidate the Phase 2 integration
test suite + CI wiring so the verification line in `PHASE_MANIFEST.md`
("API boots; security middleware integration test passes; rate-limit smoke
test passes") is enforced by green tests.

## Scope Included
- `GET /healthz` (liveness): public, no auth, no DB or Redis check.
  Returns 200 with `{ status: 'ok', uptime, version }`.
- `GET /readyz` (readiness): public. Pings Postgres (`SELECT 1`) and Redis
  (`PING`). 200 only when both are healthy; 503 with structured failure
  detail otherwise.
- Both endpoints exercise the full security chain (P2-T4) but are NOT
  rate-limited (`@SkipRateLimit()` decorator).
- `apps/api/test/integration/` suite: aggregates the security-chain test,
  the rate-limit smoke test, the session/audit lifecycle test, the CSRF
  test, and the readiness test under one `pnpm --filter api test:integration`
  script.
- `.github/workflows/ci.yml` updated: add a job that runs
  `docker compose up -d postgres redis`, applies migrations, runs
  `pnpm --filter api test:integration`. Service health-checks before the
  step starts.
- Update `apps/api/README.md` (one paragraph) describing the API's role
  and how to run it.

## Scope Excluded
- Business module health checks (no business modules exist yet).
- Worker readiness checks (Phase 4).
- E2E tests (Playwright; Phase 3).

## Files Likely Involved
- `apps/api/src/health/health.module.ts`
- `apps/api/src/health/health.controller.ts`
- `apps/api/src/security/decorators/skip-rate-limit.decorator.ts`
- `apps/api/src/app.module.ts` (wire HealthModule)
- `apps/api/package.json` (add `test:integration` script)
- `apps/api/test/integration/index.test.ts`
- `apps/api/test/integration/readiness.integration.test.ts`
- `.github/workflows/ci.yml`
- `apps/api/README.md`

## Acceptance Criteria
- `/healthz` returns 200 with `{ status: 'ok' }` even when Postgres is down.
- `/readyz` returns 503 when Postgres is stopped; returns 200 when both
  services are up.
- `pnpm --filter api test:integration` runs all Phase 2 integration suites
  and exits 0 against docker-compose services.
- CI workflow's new job is green on the PR introducing this task.
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm audit
  --audit-level=high`, and the new integration job all clean.
- Phase 2 verification line ("API boots; security middleware integration
  test passes; rate-limit smoke test passes") is satisfied by tests that
  actually run.

## Test Requirements
- Readiness integration test: stop the Redis container, hit `/readyz`,
  assert 503; restart Redis, assert 200. (Use docker compose programmatic
  control; if too brittle in CI, use a Redis client mock injected via DI
  to simulate the down state — choose one approach and document.)
- Liveness test: hit `/healthz` while Redis is intentionally down, assert
  200.

## Security Considerations
- Health endpoints disclose no version-control or commit-sha info that
  would aid an attacker. The `version` field is a build-time constant
  baked into the image, not a hash.
- Skip-rate-limit decorator is a deliberate exception — verify it does NOT
  also skip headers, body size, or exception filter.

## Dev Environment Constraints
- All work runs natively on Ubuntu 26 (`~/repos/<project>`).
- Docker is for supporting services only (Postgres, Redis, mailpit, Azurite,
  Unleash) via `docker-compose up -d`.
- Apps run as native Node processes via `pnpm dev`. No Windows paths anywhere
  in the repo.

## Handoff Notes
- Depends on P2-T1 through P2-T5 (this task locks in Phase 2 verification).
- After this lands, Phase 2 is Done and the harness exits per ADR-022's
  phase-boundary discipline. Human review before kicking off Phase 3.

---

## Backlog

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
