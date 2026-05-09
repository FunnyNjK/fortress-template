# Testing Strategy

Last Updated: 2026-05-09

## Testing Status
Fortress Template testing strategy. Vitest-backed unit and app tests are still
ahead; Phase 0 adds **GitHub Actions** (`.github/workflows/ci.yml`) that run `pnpm lint`,
`pnpm typecheck`, `pnpm test` (Turbo; may be no-op until packages define tests),
`pnpm audit --audit-level=high`, Gitleaks, Semgrep, CodeQL, and SBOM generation on
push and pull request.

---

## Required Test Types

### Unit tests (required)
- All `packages/*/src/` business logic.
- All `apps/*/src/lib/` utilities.
- Target: ≥ 80% line coverage for `packages/*` and `apps/*/src/lib/`.
- Runner: Vitest 4.

### Integration tests (required)
- NestJS modules tested with supertest against the real NestJS DI container.
- Drizzle tests use testcontainers or the docker-compose-managed test database
  (Postgres container from `docker-compose.yml`).
- Each integration test suite imports from `packages/testing` for factories
  and fixtures.
- **API P2-T6 health + aggregated integration:** **`pnpm --filter api test:integration`** (Vitest `vitest.integration.config.ts`) runs **`apps/api/test/integration/**/*.test.ts`** serially against real Postgres + Redis; CI **`api-integration`** job (**`docker compose up -d postgres redis --wait`**, **`pnpm --filter api db:migrate`**). **`/readyz`** failure simulation uses **`vi.spyOn`** / temporary **`Redis#ping`** stubs (documented in **`readiness.integration.test.ts`**) rather than stopping shared compose services.
- **API P2-T4 security chain:** `apps/api/test/integration/security-chain.integration.test.ts` (supertest; Redis via **`REDIS_URL`** — CI **`redis`** service; skips locally if Redis unreachable unless **`CI=true`**).
- **API P2-T5 auth / CSRF:** `apps/api/test/integration/auth-flow.integration.test.ts` (supertest; Postgres + Redis; **`describe.skipIf`** when DB or Redis unavailable locally — full run in CI **`test`**/**`api-integration`** with services + env); plus **`apps/api/test/auth/jwks-dev-stub.unit.test.ts`**.

### E2E tests (required for web)
- Playwright for `apps/web` smoke tests.
- Mandatory happy path: sign up via Clerk dev mode → land in app → see
  "hello [name]" → sign out.
- Run in CI on every PR.

### Security tests (required)
- Rate limit enforcement: auth routes (20 req/60s) and general routes
  (120 req/60s) — integration test via supertest.
- CSRF double-submit verification: state-changing request without CSRF token
  returns 403.
- Security headers present: verify `X-Content-Type-Options`, `X-Frame-Options`,
  `Strict-Transport-Security`, `Content-Security-Policy` in response.
- Webhook signature verification: inbound Clerk, Stripe, and Postmark webhook
  calls with invalid HMAC return 401 before any processing.

### CI gates (required — red CI = no merge)
- lint (ESLint 10 + typescript-eslint type-checked rules)
- typecheck (`tsc --noEmit` per workspace package)
- test (Vitest — Turbo `pnpm test`; API default Vitest excludes `apps/api/test/integration/**`)
- **api-integration** (docker-compose Postgres + Redis at repo root, **`pnpm --filter api db:migrate`**, **`pnpm --filter api test:integration`**)
- e2e (Playwright smoke — can be `--reporter=line` in CI)
- dep-audit (`pnpm audit --audit-level=high`)
- gitleaks (real config, blocks on secrets detected)
- semgrep (SAST)
- codeql (SAST, GitHub-native)
- sbom (CycloneDX, uploaded as artifact)
- docker-build (build image, no push on PR)

---

## Mock Strategy

- **Clerk JWKS:** mock at the HTTP client boundary in API unit tests; use Clerk
  dev mode for E2E.
- **Postmark:** mock at the module boundary (`vi.mock`). Never hit the real
  Postmark API in tests.
- **Stripe:** mock at the module boundary. Use Stripe test-mode webhooks for
  integration tests.
- **Sentry:** mock the `@sentry/node` init in tests so errors don't pollute
  the Sentry project during CI.
- **Unleash:** mock the OpenFeature provider; test both flag-on and flag-off
  paths.
- **Redis (BullMQ):** use `ioredis-mock` for unit tests; docker-compose Redis
  for integration tests.
- **Postgres (Drizzle):** use the docker-compose Postgres for integration tests
  (not mocked — real SQL).

---

## Test Commands (root workspace scripts)

```bash
pnpm test             # vitest --run (all packages)
pnpm test:watch       # vitest (watch mode)
pnpm test:e2e         # playwright test
pnpm lint             # eslint . (all packages)
pnpm typecheck        # tsc --noEmit (all packages via Turbo)
```

Per-package (Turbo filter):

```bash
pnpm --filter api test
pnpm --filter api test:integration
pnpm --filter @fortress/web test:e2e
```

---

## Coverage Expectations

- `packages/*`: ≥ 80% line coverage.
- `apps/*/src/lib/`: ≥ 80% line coverage.
- `apps/*/src/` (outside `lib/`): behavior coverage over line coverage — one
  test per meaningful user flow, not one test per file.

---

## Known Testing Gaps
- None at template level. Per-fork gaps arise in the fork's initialization session.
