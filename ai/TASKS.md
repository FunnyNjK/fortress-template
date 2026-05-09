# Tasks

Last Updated: 2026-05-09

CHAT_END (2026-05-09): `git fetch` vs `origin/main` at `fbed14e` (clean); YAML `ci.yml` / `dependabot.yml` (**python3**); `npx pnpm@10.33.4 lint` + `typecheck` + `test` + `build`; `audit --audit-level=high` (**1 moderate**); `bash -n scripts/setup.sh`; `grep -c replace-with-` `.env.example` (=27); planning deltas only. **`P2-T2`** landed (`70dab75`); doc-hash fix (`fbed14e`).

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

**P2-T4** — Build the security middleware chain (`Unattended: Yes`). Depends on **`P2-T1`–`P2-T3`**.

---

### P2-T1: Scaffold `apps/api` (NestJS 11) with env validation — Done; see DONE_LOG.md.

### P2-T2: Wire Drizzle ORM + Postgres connection + users table — Done; see DONE_LOG.md.

### P2-T3: Add `audit_events` and `sessions` Drizzle schemas + migration — Done; see DONE_LOG.md.

---

### P2-T4: Build the security middleware chain
Status: Backlog
Owner: TBD
Priority: High

## Goal
Implement the inbound boundary protection chain in the order documented in
`/ai/reference/NEW_TEMPLATE_PROMPT.md` "API hardening": security headers →
body size limit → rate limiter → Zod ValidationPipe → safe request logger →
centralized exception filter. No auth dependency yet; the chain protects all
routes including the future health endpoints.

## Scope Included
- `apps/api/src/security/` module exposing each component.
- Helmet-equivalent header set: HSTS preload, COOP/COEP, X-Frame-Options
  DENY, X-Content-Type-Options nosniff, Referrer-Policy
  strict-origin-when-cross-origin, Permissions-Policy locked down.
- Body size limit: 256KB default; Nest decorator `@AllowLargeBody(size)` for
  per-route opt-in.
- Rate limiter: token bucket via Redis (ioredis client wired here, shared
  later with BullMQ). Defaults: general routes 120/60s per IP + per session;
  routes tagged with `@AuthRoute()` 20/60s. Per-IP and per-session counters
  combined. 429 response with `Retry-After`.
- Global Zod `ValidationPipe`: fails 400 on schema violation, returns
  generic message, never echoes user input.
- Safe request logger middleware: structured Pino log per request with
  redaction; never logs request body, only path/method/status/duration/ids.
- Global exception filter: maps known errors to canonical codes; unknown
  errors become 500 with no stack/message leakage; correlates via request id.

## Scope Excluded
- Authentication / JWKS verification (P2-T5).
- CSRF middleware (P2-T5).
- Session/audit lookups (P2-T5).
- Health endpoints (P2-T6) — but the chain MUST cover them when added.

## Files Likely Involved
- `apps/api/src/security/security.module.ts`
- `apps/api/src/security/headers.middleware.ts`
- `apps/api/src/security/body-size.middleware.ts`
- `apps/api/src/security/rate-limit.guard.ts`
- `apps/api/src/security/redis.provider.ts`
- `apps/api/src/security/validation.pipe.ts`
- `apps/api/src/security/request-logger.middleware.ts`
- `apps/api/src/security/exception.filter.ts`
- `apps/api/src/security/decorators/auth-route.decorator.ts`
- `apps/api/src/security/decorators/allow-large-body.decorator.ts`
- `apps/api/src/app.module.ts` (wire chain)
- `apps/api/test/security/*.integration.test.ts`

## Acceptance Criteria
- A stub controller (test-only or behind a `NODE_ENV !== 'production'` guard)
  is reachable; the integration test exercises the full chain against it.
- 121st request inside 60s on a general route returns 429 with `Retry-After`.
- 21st request inside 60s on an `@AuthRoute()` returns 429.
- POST with > 256KB body returns 413 unless route is `@AllowLargeBody`.
- POST with malformed JSON or Zod schema mismatch returns 400 with generic
  body (no echoed input).
- Thrown `Error('boom')` inside a handler returns 500 with no stack in the
  response body.
- Pino logs do not contain `Authorization`, `Cookie`, or any redacted field
  values (verified by inspecting captured log lines in the test).
- Required security headers present on every response.

## Test Requirements
- supertest integration suite under `apps/api/test/security/`. Runs against
  `docker-compose up -d redis postgres` (Redis required for rate limiter
  state).
- Rate-limit smoke test asserts both general and auth thresholds.
- Header-presence assertion test.

## Security Considerations
- This is THE inbound boundary task. Order matters; verify the registration
  order (headers must run before logger so 4xx responses still carry them).
- Rate limiter must key on both IP and session id once sessions exist
  (P2-T5); for now key on IP and a placeholder session header.
- Exception filter must NEVER serialize stack traces in production responses.

## Dev Environment Constraints
- All work runs natively on Ubuntu 26 (`~/repos/<project>`).
- Docker is for supporting services only (Postgres, Redis, mailpit, Azurite,
  Unleash) via `docker-compose up -d`.
- Apps run as native Node processes via `pnpm dev`. No Windows paths anywhere
  in the repo.

## Handoff Notes
- Depends on P2-T1 (config + Pino baseline). Independent of P2-T2/T3/T5
  except for the Redis client provider, which P2-T5 will reuse.
- Pin `ioredis`, `helmet` (or hand-rolled equivalent), and rate-limit lib
  versions exactly.

---

### P2-T5: Server-side session/audit record service + JWKS verifier (stub) + CSRF
Status: Backlog
Owner: TBD
Priority: High

## Goal
Implement the ADR-021 server-side session/audit record service, a JWKS
verifier interface (with a dev-only stub implementation; real Clerk wiring
lands in Phase 3), the `__Host-` CSRF cookie + double-submit verification,
an `AuthenticatedGuard`, and a single guarded `/auth/me` endpoint that
exercises the full auth path end-to-end.

## Scope Included
- `apps/api/src/auth/jwks.verifier.ts`: interface + dev stub. Stub accepts
  `x-debug-user-id` header ONLY when `NODE_ENV !== 'production'` and the
  config flag `ALLOW_DEV_AUTH=true` is set; produces fabricated claims
  `{ sub: <header>, iss: 'dev', exp, iat }`. Production NestJS module
  composition refuses to bind the stub.
- `apps/api/src/auth/session.service.ts`: `upsert(claims, request)` →
  hashes the bearer token (via `@fortress/crypto` HMAC), hashes the
  client IP and User-Agent, upserts into `sessions` keyed on
  `hashed_session_token`, refreshes `last_seen_at`, returns `{ sessionId,
  userId }`. Redis-backed hot cache for `stepped_up_at` (write-through;
  Postgres is source of truth).
- `apps/api/src/auth/audit.service.ts`: `log({ userId, sessionId, action,
  resource?, metadata? })` → inserts into `audit_events` with hashed
  IP/UA from the request context. Sync write; do not swallow errors.
- `apps/api/src/auth/authenticated.guard.ts`: runs the verifier, calls
  `SessionService.upsert`, attaches `{ userId, sessionId }` to the request,
  rejects with 401 on any failure.
- `apps/api/src/auth/csrf.middleware.ts`: issues a `__Host-fortress-csrf`
  cookie (HttpOnly: false, Secure, SameSite=Strict, Path=/) on session
  creation; verifies the double-submit token on all state-changing methods
  (POST/PUT/PATCH/DELETE) for authenticated routes; rejects 403 on mismatch.
- `apps/api/src/auth/auth.controller.ts`: `GET /auth/me` (guarded) returns
  `{ id, clerkUserId }` from the session row.
- Wire the rate limiter (P2-T4) to also key on `sessionId` once the request
  is authenticated.

## Scope Excluded
- Real Clerk JWKS verifier (Phase 3 swaps the stub via the same interface).
- `@RequireRoles()` / RBAC (Phase 3).
- Step-up auth UX flow on the web side (Phase 3).
- API keys (separate concern; later phase).

## Files Likely Involved
- `apps/api/src/auth/auth.module.ts`
- `apps/api/src/auth/jwks.verifier.ts`
- `apps/api/src/auth/jwks.dev-stub.ts`
- `apps/api/src/auth/session.service.ts`
- `apps/api/src/auth/audit.service.ts`
- `apps/api/src/auth/authenticated.guard.ts`
- `apps/api/src/auth/csrf.middleware.ts`
- `apps/api/src/auth/auth.controller.ts`
- `apps/api/src/app.module.ts` (wire AuthModule, attach CSRF middleware)
- `apps/api/src/security/rate-limit.guard.ts` (extend keying on sessionId)
- `apps/api/test/auth/session-lifecycle.integration.test.ts`
- `apps/api/test/auth/csrf.integration.test.ts`
- `apps/api/test/auth/auth-me.integration.test.ts`

## Acceptance Criteria
- First request with `x-debug-user-id: u1` (dev mode) creates exactly one
  `users` row (if missing) and one `sessions` row, and writes one
  `audit_events` row tagged `auth.session.created`.
- Second request with the same identity reuses the same session row
  (no new row), updates `last_seen_at`, and does NOT write a duplicate
  `auth.session.created` audit event.
- Request without the dev header to a guarded endpoint returns 401.
- Production-mode build refuses to register the dev stub verifier
  (composition-time error if attempted).
- POST to a guarded route without a valid CSRF double-submit returns 403.
- GET `/auth/me` (guarded) returns the current user payload.
- All `audit_events` writes survive an attempted `UPDATE` (regression-tests
  the P2-T3 trigger).

## Test Requirements
- Integration tests as above; supertest against the full Nest app with
  Postgres + Redis up.
- Unit test: `session.service.upsert` is idempotent for the same hashed
  token within a request burst.

## Security Considerations
- The dev stub MUST be fail-closed in production. Test the composition-time
  refusal.
- Bearer tokens are hashed before they touch the DB. Plain tokens never
  log.
- IP and User-Agent hashing uses a key from env (validated in P2-T1) so
  hashes are stable across instances but unjoinable to raw values without
  the key.
- CSRF cookie uses `__Host-` prefix → must be Secure, no Domain attribute,
  Path=/.

## Dev Environment Constraints
- All work runs natively on Ubuntu 26 (`~/repos/<project>`).
- Docker is for supporting services only (Postgres, Redis, mailpit, Azurite,
  Unleash) via `docker-compose up -d`.
- Apps run as native Node processes via `pnpm dev`. No Windows paths anywhere
  in the repo.

## Handoff Notes
- Depends on P2-T1, P2-T2, P2-T3, P2-T4.
- Phase 3 will replace `JwksDevStub` with `JwksClerkVerifier` (same
  interface). No other changes to this module expected.
- Keep the `JwksVerifier` interface narrow: `verify(token: string):
  Promise<{ sub: string; iss: string; exp: number; iat: number }>`.

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
