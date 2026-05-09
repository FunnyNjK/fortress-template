# Tasks

Last Updated: 2026-05-09

CHAT_END (2026-05-09): **`origin/main`** **`f65aca4`** (**`P2-T6`** **`feat(api)`**); Ritual **`CHAT_END_PROMPT.md`**; **`npx pnpm@10.33.4`** `lint` `typecheck` `test` `build`; CI **`api-integration`** (**`ci.yml`**); **`pnpm audit --audit-level=high`** (**moderate: 1**); **`grep -c replace-with-`** **`.env.example`** (=28); **`TESTING.md`** (**`test/integration/`**, **`test:integration`**); Phase 2 complete — **human review before Phase 3** (**`Unattended: Partial`**). Next **`apps/web`** after approval.

Phase 0 is **complete** (P0-T1–P0-T8). **Phase 1** is **complete** (P1-T1–P1-T6). **Phase 2**
(`apps/api` skeleton): **complete** (**P2-T1–P2-T6**). Phase 3–8 remain Backlog until decomposed.

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

**Phase 3 (web skeleton)** — first decomposed task TBD (`Unattended: Partial` — see matrix). Pick up from **`Backlog`** / **`ROADMAP.md`** **after human approves Phase 3** per ADR-022.

---

### P2-T1: Scaffold `apps/api` (NestJS 11) with env validation — Done; see DONE_LOG.md.

### P2-T2: Wire Drizzle ORM + Postgres connection + users table — Done; see DONE_LOG.md.

### P2-T3: Add `audit_events` and `sessions` Drizzle schemas + migration — Done; see DONE_LOG.md.

---

### P2-T4: Build the security middleware chain — Done; see DONE_LOG.md.

---

### P2-T5: Server-side session/audit record service + JWKS verifier (stub) + CSRF — Done; see DONE_LOG.md.

---

### P2-T6: Health endpoints + Phase 2 verification harness — Done; see DONE_LOG.md.

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
