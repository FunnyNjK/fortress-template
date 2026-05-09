# Tasks

Last Updated: 2026-05-09

CHAT_END (2026-05-09): Phase 2 reviewer prompt (`REVIEW_PHASE_PROMPT.md`) returned **FIX BEFORE NEXT PHASE** on **`origin/main`** **`9e57519`**. CI red on `lint`, `test`, and the new `api-integration` job (root cause: workspace `dist/` not built before downstream Turbo tasks; `dependsOn: ["^build"]` missing in `turbo.json`). Three security regressions: `AuthenticatedGuard` registered before `RateLimitGuard` (unauth flooding bypasses rate limit), CSRF `__Host-` cookie omits `Secure` outside `NODE_ENV=production` (RFC 6265bis violation), security middleware chain registration order deviates from spec (request logger at position 3 instead of 5). One ENV hardening gap (`NODE_ENV` defaults to `development` in schema; misconfigured prod could install dev JWKS stub). One process gap (CHAT_END ritual didn't run `gh run view` against origin and so claimed "Phase 2 complete" against red CI). **P2-T7 remediation pass decomposed** and added to this file plus `phase-manifest.json` and `PHASE_MANIFEST.md` (Phase 2 task_count 6 → 7, phase status remains `Ready`, NOT `Complete`). Next: `./run-phase.sh 1` to execute P2-T7, then re-run `REVIEW_PHASE_PROMPT.md` before Phase 3.

Phase 0 is **complete** (P0-T1–P0-T8). **Phase 1** is **complete** (P1-T1–P1-T6). **Phase 2**
(`apps/api` skeleton): **T1–T6 on origin/main but NEEDS FIX per phase review** (CI red,
guard-order regression, CSRF `Secure` regression, middleware-order deviation); **T7
remediation pass decomposed and pending**. Phase 2 only counts as Done after P2-T7 lands
AND the reviewer prompt returns APPROVED on the new origin/main HEAD. Phase 3–8 remain
Backlog until decomposed.

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
| P2-T7   | Yes        | —                                |

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

**P2-T7** (Backlog → Ready when harness picks up). Phase 2 remediation pass addressing all
REDs + YELLOWs #1–#4 from the Phase 2 review. Phase 2 stays in `Ready` (not `Complete`)
until P2-T7 lands AND the reviewer prompt returns APPROVED on the new origin/main HEAD.
Run with `./run-phase.sh 1`. Do NOT start Phase 3 from this task.

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

### P2-T7: Phase 2 remediation pass — CI build deps + API security regressions + NODE_ENV hardening
Status: Backlog
Owner: TBD
Priority: High

## Goal
Address every finding from the Phase 2 review (verdict: FIX BEFORE NEXT
PHASE). Fix the broken CI gate first so subsequent fixes are actually
verified by tests, then close the API security regressions (guard order,
middleware order, CSRF Secure attribute, NODE_ENV defaulting), then close
the process gaps that let "Phase 2 complete" be claimed against red CI.
After this task lands, Phase 2 is re-reviewed; only then is the phase Done.

## Scope Included

### CI build dependency (RED #1)
- Add `dependsOn: ["^build"]` to the `lint` and `test` task definitions in
  `/turbo.json`. The `api-integration` job in `.github/workflows/ci.yml`
  must also run `pnpm -r build` (or rely on Turbo's transitive dep) before
  `pnpm --filter api test:integration`.
- Verify locally: delete every `packages/*/dist` directory, run
  `pnpm install --frozen-lockfile && pnpm lint && pnpm test &&
  pnpm --filter api test:integration` from a clean state. All must pass.

### CI test job DATABASE_URL host (RED #5)
- In `.github/workflows/ci.yml` line 126 (the `test` job), change
  `DATABASE_URL: postgresql://fortress:test@postgres:5432/fortress` to use
  `127.0.0.1:5432`. The `api-integration` job already uses `127.0.0.1` —
  match its pattern. Service-container hostnames only resolve when the job
  itself runs in a container; the `test` job runs on the runner host.

### Guard order regression (RED #3)
- In `apps/api/src/app.module.ts`, reorder the `APP_GUARD` provider list so
  `RateLimitGuard` is registered BEFORE `AuthenticatedGuard`. Nest evaluates
  guards in registration order; rate limit must be the first gate so unauth
  flooding is counted regardless of token validity.
- Add an integration test under
  `apps/api/test/security/rate-limit-unauth.integration.test.ts` that bursts
  121 requests at a guarded route with no Authorization header and asserts
  the 121st returns 429 (not 401). Today this test would fail; after the fix
  it must pass.

### Security middleware order (RED #2)
- The spec order is headers → body size → rate limit → Zod validation →
  request logger → exception filter. The current registration runs the
  request logger as middleware at position 3, before guards (rate limit) or
  pipes (Zod). Re-implement the request logger as a NestJS Interceptor
  (NOT middleware), wired globally via `APP_INTERCEPTOR`. Interceptors run
  AFTER guards and pipes, satisfying the spec ordering.
- Update the security-chain integration test to assert (a) the logger fires
  AFTER the rate limiter rejects (rate-limited requests should still be
  logged with status 429), (b) the logger fires AFTER Zod rejects
  (validation failures logged with status 400), and (c) the logger does
  NOT fire when the body size middleware rejects (413), since middleware
  runs before interceptors and short-circuits the lifecycle.
- If reimplementing the logger as an interceptor is materially harder than
  expected, an acceptable alternative is to move the logger to a global
  exception filter / response interceptor pair. Document the choice in
  the commit message.

### CSRF __Host- cookie Secure attribute (RED #4)
- In `apps/api/src/auth/csrf.middleware.ts` (lines 36–47 per the review),
  remove the `NODE_ENV === 'production'` gate around the `Secure` cookie
  attribute. Always emit `Secure` on `__Host-` cookies — RFC 6265bis
  requires it, and conformant browsers reject the cookie otherwise.
- Update `apps/api/test/integration/auth-flow.integration.test.ts` to
  assert the actual `Set-Cookie` header string contains `Secure` regardless
  of `NODE_ENV`. Today the test only checks cookie value via supertest's
  parser, which masks the attribute issue.
- Note for local dev: with `Secure` always on, `__Host-` cookies will not
  be set on `http://` origins. Document in `apps/api/README.md` that local
  dev requires either `https://` (mkcert) or accepting that CSRF-protected
  flows will not work over plain HTTP. Phase 3 web-side work will assume
  `https://` locally.

### NODE_ENV hardening (YELLOW #2)
- In `apps/api/src/config/env.schema.ts`, make `NODE_ENV` required (drop
  the `.default('development')`). A misconfigured prod deploy with empty
  NODE_ENV must fail at startup, not silently become 'development' (which
  would install the dev JWKS stub).
- In `apps/api/src/main.ts`, add an explicit assertion at bootstrap: if
  `NODE_ENV === 'production'`, log the JWKS verifier class name and assert
  it is NOT `DevJwksStubVerifier`. This is defense-in-depth on top of the
  existing composition-time refusal.
- Update `.env.example`: keep `NODE_ENV=development` present (the schema
  requires it, so .env must define it) and add a comment that production
  deploys must override to `NODE_ENV=production`.
- Update `.env`-generation in `scripts/setup.sh` if needed so dev `.env`
  always has `NODE_ENV=development` explicitly set.

### Rate limiter fail-open documented (YELLOW #1)
- Add a new ADR: `ADR-028: Rate limiter fails open when Redis is
  unavailable`. Document the decision: prefer availability over enforcement
  when the rate-limit backend is down, but log a high-severity warning on
  every fail-open and emit a metric (`security.rate_limit.fail_open`) that
  alerts can hook.
- In `apps/api/src/security/rate-limit.guard.ts` (lines 85–92 per the
  review), add the warning log and the metric counter. Do not change the
  fail-open behavior itself — the ADR ratifies it.

### CHAT_END ritual hardening (YELLOW #4)
- Update `/ai/templates/CHAT_END_PROMPT.md` to require, before any "Phase
  N complete" claim:
  1. `gh run list --branch main --limit 1 --json status,conclusion,headSha`
     output captured into the CHAT_END section.
  2. Explicit statement that the latest origin/main run conclusion is
     `success`. If it is not, the CHAT_END must NOT claim phase completion;
     instead it documents the CI-red state and surfaces it to the human.
- Verify by running the updated CHAT_END prompt manually on the current
  state and confirm it would have refused to mark Phase 2 done.

### HANDOFF baton refresh (YELLOW #3)
- Update `/ai/HANDOFF.md` so the CHAT_END section's pickup baton SHA
  matches the current origin/main HEAD (post-this-task). The baton is a
  pointer; a stale pointer is a pickup hazard for the next AI session.

## Scope Excluded
- Caret/tilde version ranges in package.json (YELLOW #5; deferred per
  post-Phase-1 cleanup commit rationale; lockfile is the truth source).
- Any new feature work (this is a remediation task — no new endpoints,
  no new tables, no new packages).
- Phase 3 prep (web skeleton). Do not start Phase 3 from this task.

## Files Likely Involved
- `turbo.json`
- `.github/workflows/ci.yml`
- `apps/api/src/app.module.ts`
- `apps/api/src/security/security.module.ts`
- `apps/api/src/security/request-logger.interceptor.ts` (new — replaces
  the middleware)
- `apps/api/src/security/rate-limit.guard.ts`
- `apps/api/src/auth/csrf.middleware.ts`
- `apps/api/src/config/env.schema.ts`
- `apps/api/src/main.ts`
- `apps/api/test/security/rate-limit-unauth.integration.test.ts` (new)
- `apps/api/test/integration/auth-flow.integration.test.ts`
- `apps/api/test/security/middleware-chain.integration.test.ts`
- `apps/api/README.md`
- `.env.example`
- `scripts/setup.sh`
- `ai/DECISIONS.md` (ADR-028)
- `ai/templates/CHAT_END_PROMPT.md`
- `ai/HANDOFF.md`

## Acceptance Criteria
- `gh run list --branch main --limit 1 --json status,conclusion` returns
  `"conclusion": "success"` after this task's commits land on origin/main.
- `pnpm lint`, `pnpm test`, `pnpm typecheck`, `pnpm audit
  --audit-level=high`, and `pnpm --filter api test:integration` all green
  locally on a clean checkout (no pre-existing `dist/` directories).
- New unauth-rate-limit integration test passes: 121 unauthenticated
  requests inside 60s to a guarded route → 121st returns 429.
- Existing security-chain integration test passes with the logger now
  firing at the correct lifecycle position (assertions added per scope).
- Existing auth-flow integration test now asserts `Secure` is present in
  the literal `Set-Cookie` header regardless of `NODE_ENV`, and passes.
- Booting the API with empty `NODE_ENV` fails fast at startup (env schema
  rejects).
- ADR-028 exists in `ai/DECISIONS.md` and is linked from the rate-limit
  guard's source code comment.
- Updated CHAT_END prompt run manually against current state correctly
  refuses to mark a phase done if CI is red.

## Test Requirements
- One new integration test (rate-limit-unauth).
- Two updated integration tests (security chain order assertions, CSRF
  cookie attribute assertion).
- One new env-schema unit test asserting empty NODE_ENV is rejected.

## Security Considerations
- The CSRF Secure fix is RFC compliance; do not weaken it again under any
  "but local dev" pressure.
- The guard order fix is the highest-priority security change in this
  task. Verify with the new test, not just by code reading.
- The NODE_ENV hardening is defense-in-depth; the existing composition-time
  refusal stays — this just adds another layer.

## Dev Environment Constraints
- All work runs natively on Ubuntu 26 (`~/repos/<project>`).
- Docker is for supporting services only (Postgres, Redis, mailpit, Azurite,
  Unleash) via `docker-compose up -d`.
- Apps run as native Node processes via `pnpm dev`. No Windows paths anywhere
  in the repo.

## Handoff Notes
- Depends on P2-T1 through P2-T6 (this task fixes regressions found in
  the Phase 2 review).
- After this lands and CI is green on origin/main, re-run the Phase 2
  reviewer prompt (`/ai/templates/REVIEW_PHASE_PROMPT.md`) with the same
  Phase-2-specific watchouts. Phase 2 only completes when the reviewer
  returns APPROVED.
- Do NOT start Phase 3 (web skeleton) from this task. Phase boundary
  discipline per ADR-022.

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