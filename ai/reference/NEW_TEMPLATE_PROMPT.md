# Prompt: Build the "Fortress" production template

> Use this prompt to bootstrap a new repository that will serve as a forkable, security-first, production-grade template for future SaaS apps. The output of this prompt is a **template**, not an application. After scaffolding, the template will be forked per-product and a follow-up AI pass will wire in product-specific features.

---

## Mission

Build a forkable monorepo template called **`fortress-template`** that represents the latest-and-greatest TypeScript SaaS architecture as of 2026, with security as a first-class concern at every layer. It should be opinionated, production-ready on day one, and structured so that a fork plus a follow-up AI scaffolding pass can produce a real application without re-litigating any architectural decision.

Think: "if I were starting a new SaaS company tomorrow, what would I want already done before I write the first line of business logic?"

---

## Locked decisions

These are committed. The scaffolding agent must not deviate. If a deviation appears necessary, the agent must stop and surface a written tradeoff for human approval before proceeding.

| # | Decision | Choice |
|---|---|---|
| 1 | Identity provider | **Clerk** (Stytch documented as swap) |
| 2 | ORM | **Drizzle** |
| 3 | Cloud (primary) | **Azure** with Terraform (AWS module shipped in parallel as documented swap) |
| 4 | Compliance baseline | **SOC 2 + GDPR**-friendly defaults; HIPAA/PCI are explicit add-ons |
| 5 | Tenancy | **Single-tenant** (multi-tenant upgrade runbook included) |
| 6 | Marketing framework | **Astro** |
| 7 | Email | **Postmark** (Resend documented as swap) |
| 8 | Feature flags | **Unleash** (self-hosted) + OpenFeature SDK |
| 9 | Error tracking | **Sentry** (PII scrubbing on by default) |
| 10 | Tracing backend | **Grafana Tempo** via OTLP; Azure Monitor as log/metric sink |

---

## Non-negotiables (security & architecture invariants)

These are inviolable. If a tradeoff appears to require breaking one, stop and document the conflict instead of breaking it.

1. **The web app never touches the database directly.** All persistence flows through the API/business layer.
2. **Server-side audit/session record on the API.** Clerk handles authentication and the user-facing session for B2C UX. Our API still issues a server-side session/audit record for every authenticated request — used for revocation, audit logging, and step-up auth on sensitive operations.
3. **Secrets never live in code or in the repo.** Local dev uses a generated `.env`; CI uses encrypted variables; prod uses **Azure Key Vault** (default) or AWS Secrets Manager (when on the AWS module).
4. **All inbound boundaries are validated.** Zod at every API edge and webhook ingress. No exceptions.
5. **All sensitive data at rest is encrypted with AES-256-GCM.** Keys are versioned and managed in Azure Key Vault. Key rotation is a documented runbook step, not a code change.
6. **TLS 1.3 only.** Strict-Transport-Security with preload. No HTTP listeners except for health checks behind the load balancer.
7. **Marketing site is on a different subdomain than the app.** Cookie scope, CSP, and analytics are isolated.
8. **CSRF protection on all state-changing API requests.** Double-submit token pattern, with `__Host-` cookie prefix on the API session cookie.
9. **Every privileged action is auditable.** Append-only `audit_events` table; immutable; structured.
10. **CI gates merges.** Lint, typecheck, tests, dependency audit, secret scan, SAST, SBOM. Red CI = no merge.

---

## Phase plan (mandatory)

The scaffolding agent **must not** attempt to build everything in one pass. Before any code is written, the agent will:

1. Read this entire prompt.
2. Produce a written phase plan with task lists, acceptance criteria, and a verification step for each phase.
3. Wait for human approval of the plan.
4. Execute one phase at a time, stopping after each to produce a status update and await "go".
5. After each phase, ensure the verification step passes (CI green, smoke test passing, etc.) before requesting approval to proceed.

### Suggested phases (the agent may refine before approval; phases must not be merged)

| Phase | Scope | Verification |
|---|---|---|
| 0 | Repo skeleton, monorepo tooling (pnpm, Turbo, tsconfig, eslint), CI workflow scaffolding, `.env.example`, `security.txt`, `AGENTS.md`, `PROJECT_STATUS.md` | `pnpm install`, `pnpm typecheck`, `pnpm lint` all pass; CI runs green on the initial commit |
| 1 | Shared packages: `config-typescript`, `config-eslint`, `types`, `crypto`, `auth-core`, `observability`, `sdk`, `testing` | Each package has smoke tests; all build, lint, and link correctly |
| 2 | API skeleton: NestJS app with env validation, security middleware chain, health endpoints, audit log table + service. No business modules yet. | API boots; security middleware chain integration test passes; rate-limit smoke test passes |
| 3 | Web skeleton: Next.js with Clerk integration, layout, protected route group, calls to `sdk` for `/auth/me` | E2E: a user can sign up via Clerk, land in app, see "hello, [name]", sign out |
| 4 | Worker skeleton: BullMQ consumer with one example idempotent job (welcome email via Postmark) | Worker consumes a test job; retry/backoff demonstrated; Postmark webhook signature verifies |
| 5 | Marketing site: Astro with hardened CSP, privacy-respecting analytics, `security.txt`, cookie consent | Lighthouse 95+ on perf and security headers; CSP report-only mode wired |
| 6 | Infra: Terraform Azure module set (primary) + AWS module set (parallel swap), both `terraform plan`-clean for `dev` | `terraform plan -var-file=dev.tfvars` succeeds for both clouds |
| 7 | Docs: architecture, security threat model (STRIDE), ADRs, runbooks (incident, DR, restore, key rotation, secret rotation, DSAR export, DSAR delete, multi-tenant upgrade), `AGENTS.md`, `PROJECT_STATUS.md` final pass | All runbooks linked from `docs/index.md`; no broken links |
| 8 | Acceptance: end-to-end verification against the full acceptance-criteria list; gap fixing | Every box in "Acceptance criteria" checked |

The agent may sub-divide a phase if it can't fit in a single session, but must not merge phases.

---

## High-level architecture

Three internet-facing properties, on three separate subdomains, with strict boundaries.

```
www.example.com  → Marketing site (static, edge-hosted, Astro)
app.example.com  → Web app (Next.js)        — no DB access
api.example.com  → API / business layer (NestJS) — sole DB owner
                   ↳ Postgres        (Azure DB for PostgreSQL Flexible Server, private)
                   ↳ Redis           (Azure Cache for Redis, private)
                   ↳ Object storage  (Azure Blob Storage, signed URLs only)
                   ↳ Worker tier     (BullMQ, separate Container App)
```

### Layer responsibilities

**Marketing layer (`apps/marketing`)** — Astro static site. No auth, no DB. Hardened CSP, no third-party scripts unless audited. Privacy-respecting analytics (Plausible by default; Fathom or self-hosted Umami documented as swaps). Cookie consent banner shown if any cookies are set. Hosted on Azure Static Web Apps (or Cloudflare Pages).

**Web/app layer (`apps/web`)** — Next.js 16 App Router, React 19, Tailwind 4. Handles user-facing rendering and the Clerk handshake. Clerk owns the authenticated session UX. The web app calls our API through a typed SDK (`@fortress/sdk`). **Never** queries the database directly. Lives on `app.example.com`.

**API/business layer (`apps/api`)** — NestJS 11. Sole owner of database access, business rules, authorization, encryption, and audit logging. Validates every request boundary with Zod. Verifies Clerk session tokens on every request, then enriches with our own server-side session/audit record. Runs the security middleware chain (headers → body size → rate limit → input validation → safe logging → exception filter). Lives on `api.example.com`.

**Worker layer (`apps/worker`)** — BullMQ consumer, separate process, separate scaling. Handles email sends (via Postmark), webhook deliveries, async jobs, scheduled tasks. Idempotent job IDs, exponential backoff, dead-letter queue with alerting.

**Data layer** — Postgres 18 (Azure DB for PostgreSQL Flexible Server), Redis 8 (Azure Cache for Redis), object storage (Azure Blob Storage). Postgres is in a private subnet; only the API and worker can reach it. Connection pooling via PgBouncer (transaction mode). Read replica configured but not required at template time.

---

## Tech stack (pinned, current as of May 2026)

| Concern | Choice | Why |
|---|---|---|
| Language | TypeScript 6.x, strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` | Compiler is the cheapest test |
| Package manager | pnpm 10.x | Fastest, strictest, workspace-native |
| Monorepo orchestration | Turbo 2.x | Caching + task graph |
| Marketing | Astro | Static, fast, minimal JS |
| Web | Next.js 16 App Router | RSC + Server Actions |
| API | NestJS 11 | DI, modules, guards — ideal for security boundaries |
| ORM | Drizzle 0.45+ | Type-safe SQL, no codegen, AI-scaffolder-friendly |
| Database | Postgres 18 | Mature, RLS available if tenancy changes |
| Cache/queue/sessions | Redis 8 | BullMQ + rate limit + session lookup |
| Identity | **Clerk** (B2C-optimized) | Native passkeys, prebuilt UI, strong DX |
| Validation | Zod 4 | At every boundary |
| Styling | Tailwind 4 | Utility-first |
| Testing | Vitest 4 + supertest + Playwright | One runner, one config |
| Linting | ESLint 10 + typescript-eslint type-checked | Strict shared config |
| Formatting | Prettier 3 | One config |
| Logging | Pino + nestjs-pino | Fast, structured, redaction-aware |
| Tracing | OpenTelemetry → OTLP → Grafana Tempo | Vendor-neutral |
| Metrics | Prometheus client + OTel | Standard |
| Errors | Sentry | PII scrubbing on by default |
| Email | **Postmark** | Best-in-class transactional deliverability + stream separation |
| Object storage | Azure Blob Storage | Native to Azure-first stack |
| Billing | Stripe — wired but feature-flagged | Industry standard |
| Feature flags | Unleash (self-hosted) + OpenFeature SDK | Open standard, no lock-in |
| Cloud | Azure (primary), AWS (parallel module) | User preference |
| IaC | Terraform | Both Azure and AWS module sets |
| Secrets | Azure Key Vault (Azure) / AWS Secrets Manager (AWS) | Native to each cloud |

---

## Repository layout

```
fortress-template/
├── apps/
│   ├── marketing/              # Astro — static
│   ├── web/                    # Next.js 16 App Router
│   ├── api/                    # NestJS 11
│   └── worker/                 # BullMQ consumer
├── packages/
│   ├── sdk/                    # Typed HTTP client + Zod schemas, web↔api contract
│   ├── types/                  # Domain types and Zod schemas (no runtime deps)
│   ├── ui/                     # Shared React components, design system tokens
│   ├── config-typescript/      # Shared tsconfig bases (base, next, node, library)
│   ├── config-eslint/          # Shared ESLint configs (base, next, node)
│   ├── crypto/                 # AES-256-GCM, HMAC, key versioning helpers
│   ├── auth-core/              # Session/audit record creation, hashing, CSRF, cookie helpers
│   ├── observability/          # Logger, tracer, metrics setup; one import per app
│   └── testing/                # Test harness, factories, fixtures
├── infra/
│   ├── terraform/
│   │   ├── modules/
│   │   │   ├── azure/          # PRIMARY: container-apps, postgres-flexible, redis, blob, key-vault, front-door, dns
│   │   │   └── aws/            # PARALLEL: ecs-fargate, rds, elasticache, s3, secrets-manager, cloudfront, route53
│   │   └── environments/
│   │       ├── dev/
│   │       ├── staging/
│   │       └── prod/
│   └── docker/                 # Dockerfiles for each app
├── docs/
│   ├── index.md
│   ├── architecture.md
│   ├── security.md             # STRIDE threat model, controls map
│   ├── runbooks/
│   │   ├── incident-response.md
│   │   ├── disaster-recovery.md
│   │   ├── restore.md
│   │   ├── rotate-encryption-keys.md
│   │   ├── rotate-secrets.md
│   │   ├── dsar-export.md
│   │   ├── dsar-delete.md
│   │   └── upgrade-to-multitenant.md
│   ├── compliance/
│   │   ├── soc2-controls.md
│   │   ├── gdpr.md
│   │   └── retention.md
│   ├── adrs/                   # Architecture Decision Records, numbered
│   ├── legal/                  # Privacy policy + ToS templates
│   └── onboarding.md
├── scripts/
│   ├── setup.sh                # Generate .env, seed local DB, install hooks (Ubuntu-only per ADR-023)
│   ├── rotate-keys.ts
│   └── new-migration.ts
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # lint, typecheck, test, audit, gitleaks, semgrep, codeql, sbom
│   │   ├── deploy-staging.yml
│   │   ├── deploy-prod.yml
│   │   └── codeql.yml
│   ├── dependabot.yml
│   └── CODEOWNERS
├── .well-known/
│   └── security.txt
├── AGENTS.md
├── CLAUDE.md
├── PROJECT_STATUS.md
├── README.md
├── docker-compose.yml
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## Identity, auth, and session model

This is the most important part. Read carefully.

### Identity provider: Clerk

The template integrates with Clerk via its Next.js SDK on the web side. Clerk handles:

- Sign-up / sign-in flows (prebuilt UI components, customizable)
- Social providers (Google, Apple, etc.)
- Magic links
- **Passkeys (WebAuthn)** as a primary factor
- MFA enrollment and step-up
- User profile management UI

Switching to Stytch is a documented swap — the Clerk integration points are isolated in `apps/web/src/auth/` and the API side reads only Clerk-issued JWTs verified against Clerk's JWKS.

### Sessions: Clerk owns the user-facing session, our API owns the audit/security session

After Clerk authenticates a user, the web app calls the API with the Clerk-issued session token. On first request the API:

1. Verifies the Clerk JWT (issuer, audience, signature, expiry) against Clerk's JWKS
2. Upserts the local user record
3. Creates or refreshes a server-side **session/audit record** in Postgres (hashed token, last-seen, hashed IP/UA, current step-up state)
4. Returns the response with our `__Host-` prefixed CSRF cookie for state-changing requests

This gives us:

- Clerk's polished consumer UX (we don't build sign-in screens)
- Our own revocation, audit log, and step-up controls
- A clean swap path if we ever change IdPs (the API side knows nothing about Clerk except the JWKS endpoint)

### RBAC + step-up auth

- Roles enum at minimum: `user`, `admin`. Extensible via DB-backed `role_grants`.
- `@RequireRoles()` decorator on protected handlers; `RolesGuard` enforces.
- Sensitive operations (delete account, change billing, export data, generate API key) require step-up: re-prompt for passkey or fresh MFA within the last 5 minutes. Step-up state stored on our session/audit record.

### API keys (separate from user sessions)

- Per-user programmatic API keys, scoped, hashed at rest, prefix-visible (`fk_live_…`), revocable.
- Rate-limited separately from user traffic.

---

## Single-tenancy model (default; multi-tenant upgrade documented)

The template ships single-tenant:

- One row per user; no `tenant_id` column scaffolding
- Authorization is per-user, not per-tenant
- No org/team concept

A documented upgrade path exists at `docs/runbooks/upgrade-to-multitenant.md`:

- Migration template that adds `tenants` and `tenant_users` tables and a `tenant_id` column to every business table
- Postgres RLS policy patterns
- Session-side `current_tenant_id` propagation
- Per-tenant rate-limit setup

This is intended as a "future team" runbook, not an automated migration.

---

## Security baseline (the bells and whistles)

**Network/edge**
- Azure Front Door (default) in front of everything: WAF, bot management, DDoS, TLS termination
- HSTS preload; TLS 1.3 only; OCSP stapling
- Strict CSP (no `unsafe-inline`, no `unsafe-eval`); per-app CSP profiles
- Permissions-Policy locked down (no camera/mic/geolocation by default)
- Standard set: X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy: strict-origin-when-cross-origin, COOP/COEP

**API hardening**
- Middleware chain: security headers → request size limit (default 256KB; opt-in higher per route) → rate limiter (token bucket; auth routes 20/60s, general 120/60s, per IP + per session) → Zod input validation → safe request logger (PII/secret redaction) → centralized exception filter (generic error codes, no leakage)
- All controllers behind guards by default; opting out is explicit
- Output serialization via class-transformer with `excludeExtraneousValues`

**Data**
- AES-256-GCM at rest for any column tagged `@encrypted` (custom Drizzle helper); key versions tracked per row
- Soft-delete with `deleted_at`; hard-delete runbook for GDPR DSAR
- Backups: encrypted, geo-redundant, 30-day retention; quarterly restore drills documented in `docs/runbooks/restore.md`
- Connection pooling via PgBouncer (or Azure's built-in pooler); one pool per app

**Secrets**
- Local: `.env` generated by `scripts/setup.{sh,ps1}` with strong randoms; `.env.example` is the source of truth
- CI: GitHub Actions encrypted secrets
- Prod: Azure Key Vault (default); AWS Secrets Manager when on the AWS module
- Startup validation rejects placeholder values (`replace-with-*`) in production

**Supply chain**
- `pnpm audit` in CI, blocking on high/critical
- Dependabot weekly
- gitleaks (real config, not placeholder) in CI
- Semgrep + GitHub CodeQL SAST in CI
- SBOM generated per build (CycloneDX), uploaded as artifact
- All Docker images pinned by digest, not tag

**Webhooks**
- All inbound webhooks (Clerk, Stripe, Postmark) verify HMAC signature before any other processing
- All outbound webhooks signed with a per-recipient HMAC secret; signature header documented
- Replay protection via timestamp + 5-minute window

**Email-specific**
- Postmark transactional and broadcast streams kept strictly separated
- DKIM, SPF, DMARC setup documented in `docs/runbooks/email-domain-setup.md`
- Bounce/complaint webhooks handled by the worker; suppression list backed by the database

**Observability**
- Structured JSON logs via Pino; request IDs propagated end-to-end via the `traceparent` header
- OpenTelemetry tracing across web → api → worker → db
- Prometheus metrics on every service (RED + USE)
- Grafana Tempo as tracing backend; Azure Monitor as log/metric sink
- Sentry for error tracking, with PII scrubbing
- Audit log to its own table, append-only, never deleted

**Compliance hooks (SOC 2 + GDPR-friendly defaults)**
- DSAR runbook: export user data + delete user data
- Data retention policies in `docs/compliance/retention.md`
- Access review process documented (quarterly)
- `security.txt` published; vulnerability disclosure path defined
- Privacy policy + Terms of Service templates in `docs/legal/`
- Cookie consent banner toggle in marketing site

---

## CI/CD

**On every PR:**
1. Lint (ESLint, type-checked rules)
2. Typecheck (`tsc --noEmit` per workspace)
3. Unit + integration tests (Vitest)
4. E2E tests (Playwright for web smoke; supertest for API smoke)
5. Dependency audit (`pnpm audit`, blocking on high/critical)
6. Secret scan (gitleaks)
7. SAST (Semgrep + CodeQL)
8. SBOM generation (CycloneDX)
9. Docker image build (no push)

**On merge to `main`:** deploy to staging automatically.

**On tagged release:** deploy to prod via approval gate, with smoke tests post-deploy and automated rollback on health check failure.

**Migrations:** forward-only by default; reversible migrations explicitly flagged; migration runs in a pre-deploy job, not at app startup.

---

## Infrastructure as Code

Terraform modules covering both clouds. **Azure is primary**; AWS is shipped in parallel as a documented swap.

### Azure module (primary)
- Resource Group + VNet + private subnets
- Azure Database for PostgreSQL Flexible Server
- Azure Cache for Redis (Premium tier with private endpoint)
- Azure Container Apps for `api` and `worker`
- Azure Static Web Apps for `web` and `marketing` (or Container Apps for `web` if SSR is required)
- Azure Blob Storage with private access + SAS URLs
- Azure Key Vault for secrets and encryption keys
- Azure Front Door + WAF
- Azure DNS + managed certificates
- Azure Monitor + Log Analytics workspace
- Managed identities (least privilege, per-service)

### AWS module (parallel, swap)
- VPC + private subnets
- RDS PostgreSQL (or Aurora)
- ElastiCache Redis
- ECS Fargate for `api` and `worker`
- CloudFront + S3 for `web` and `marketing`
- S3 buckets with bucket policies (no public access)
- AWS Secrets Manager
- IAM roles (least privilege)
- CloudWatch + X-Ray
- Route 53 + ACM

Three environments: `dev`, `staging`, `prod`. Each has its own state file (Azure Storage backend by default for Azure; S3 + DynamoDB for AWS). The template documents the cross-subscription / cross-account assume-role pattern.

---

## Local dev experience

`pnpm setup` (or `./scripts/setup.{sh,ps1}`) does everything:
1. Generates `.env` files for each app from `.env.example` with strong randoms
2. Starts `docker-compose up -d` (Postgres, Redis, mailpit for email testing, Azurite for Blob testing, Unleash for feature flags)
3. Runs migrations
4. Seeds a dev user
5. Prints next steps

Single command to develop: `pnpm dev` (Turbo orchestrates web, api, worker, marketing in parallel with hot reload).

---

## Billing (wired, feature-flagged)

Stripe integration:
- Customer = user
- Subscriptions, metered usage, invoices, customer portal
- Webhook handler with HMAC verification
- Self-serve checkout flow in the web app, gated by feature flag (off by default in template)

---

## What is explicitly out of scope for the template

- Real Clerk account / OAuth provider credentials (placeholders only; user supplies on fork)
- Domain registration, certificates (Azure DNS / ACM is wired; user provides domain)
- Real Stripe products/prices (test-mode placeholders)
- Mobile apps
- Real ML/AI features
- Public API documentation site (OpenAPI is generated; hosting is per-fork)
- Multi-tenant scaffolding (deferred to runbook)

---

## Acceptance criteria

The template is "done" when:

1. ✅ `pnpm setup && pnpm dev` boots the full stack on a clean machine in under 5 minutes
2. ✅ A user can sign up via Clerk, land in the app, see their profile, and sign out
3. ✅ A user can register a passkey via Clerk and use it to step up for a "delete account" action (which goes through our API's step-up flow)
4. ✅ All CI gates pass on the initial commit (lint, typecheck, tests, dep audit, gitleaks, semgrep, codeql, SBOM)
5. ✅ `terraform plan -var-file=dev.tfvars` succeeds for both Azure and AWS modules with no errors (no real apply required)
6. ✅ The marketing site, web app, and API are reachable on three distinct subdomains in dev
7. ✅ Documented runbooks exist for: incident response, DR/restore, key rotation, secret rotation, DSAR export, DSAR delete, multi-tenant upgrade, email domain setup
8. ✅ `AGENTS.md` documents the layer rules clearly enough that a follow-up AI pass can wire in product features without violating them
9. ✅ `PROJECT_STATUS.md` lists every stubbed item with a TODO and a doc link
10. ✅ A `docs/security.md` STRIDE threat model exists, mapping each control to a STRIDE category
11. ✅ Phase plan was followed: each phase landed in its own commit/PR with verification evidence

---

## Build instructions for the AI scaffolding agent

You are scaffolding the template above. Constraints:

- **Don't write business logic.** This is a template. Build the chassis, not the car.
- **Don't build all phases at once.** Follow the Phase plan section: produce a phase plan, get approval, execute one phase, stop, report, request approval, continue.
- **Every choice must be defensible.** If you deviate from this prompt, stop and surface a written tradeoff for human approval before proceeding. Document accepted deviations as numbered ADRs in `docs/adrs/`.
- **Stub honestly.** If something is a placeholder, mark it loudly in `PROJECT_STATUS.md` and with a `// TODO(template):` comment.
- **Pin versions.** No `^` or `~` ranges in the initial commit. Use exact versions everywhere.
- **Test what you build.** Every package needs at least a smoke test that runs in CI.
- **Document as you go.** Every package gets a one-paragraph README explaining its role and its public surface.

When all phases are complete, the next step is: fork this template per product, then run a follow-up AI pass to add product-specific routes, schemas, and UI on top of the chassis.
