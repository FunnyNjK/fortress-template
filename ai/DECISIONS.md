# Architecture Decision Records

Last Updated: 2026-05-10

This file records decisions that affect architecture, dependencies, security,
deployment, testing, or scope. ADRs ADR-001 through ADR-010 are pre-populated
cross-project defaults. Project-specific decisions begin at ADR-011.

To override a baked-in default for a specific project, write a new ADR with
status "Accepted" that supersedes the original. Do NOT edit the baked-in ADRs
except to mark them "Superseded" and add a pointer to the new one.

---

## ADR-001: WSL-native development, no Docker for app code
Date: 2026-05-02
Status: Superseded by ADR-026 (2026-05-09)

**Superseded.** This ADR established WSL-on-Windows as the dev environment.
That decision has been replaced by ADR-026, which moves to a dedicated native
Ubuntu 26 LTS development host. The core principle of the original decision —
no Docker for the *application* itself, only for supporting services — is
preserved in ADR-026. The original Decision/Reason/Tradeoffs are kept below
for historical context.

> **Number-history note:** the migration ADR was originally written as ADR-023
> on 2026-05-09. During subsequent CHAT_END reconciliation passes that same
> day, the supersession marker on ADR-001 was reverted and the migration ADR
> body was lost; ADR-023 was then reused for an unrelated decision
> ("typescript at workspace root for Phase 0 config packages"). The migration
> ADR was restored as ADR-026 on 2026-05-10. References to "ADR-023" elsewhere
> in the planning files that mean the migration have been updated to ADR-026.

### Decision (original)
All development (dev server, tests, build, lint, type-check) runs as native
processes inside WSL Ubuntu. Docker is reserved exclusively for hosting
external dependencies the app talks to (databases, queues, cache).

### Reason (original)
Mixed dev environments (host Windows + WSL + Docker containers) create
ambiguous file paths and confuse AI agents into editing the wrong copy of a
file. WSL2 native filesystem is fast (5-20x faster than `/mnt/c`), and modern
editor tooling (VS Code/Cursor WSL Remote) handles the host/guest boundary
cleanly without containers.

### Tradeoffs (original)
- Slightly different from prod if prod runs in containers — mitigated by
  keeping app code framework-aware but environment-agnostic.
- Onboarding requires a working WSL setup.

---

## ADR-002: Static-first frontend with Astro 5 + React 19 islands
Date: 2026-05-02
Status: Superseded by ADR-016

**Superseded.** Astro is still used for the marketing site (`apps/marketing`)
on `www.example.com`. The web application (`apps/web`) uses **Next.js 16 App
Router** (SSR required for Clerk session handling and RSC). See ADR-016 for
the Astro-for-marketing decision and `/ai/ARCHITECTURE.md` for the full
three-subdomain layout.

### Decision (original)
Use Astro 5 as the page framework. Static content lives in `.astro` files;
interactive components are React 19 mounted as islands.

### Reason (original)
Marketing/static sites benefit from pre-rendered HTML for SEO, fast first
paint, and minimal JS shipped to the client.

### Tradeoffs (original)
- Astro is less ubiquitous than Next.js; some Next-specific features don't exist.

---

## ADR-003: Tailwind 4 via the official Vite plugin
Date: 2026-05-02
Status: Accepted

### Decision
Use Tailwind 4 with the `@tailwindcss/vite` plugin. Applies to both
`apps/marketing` (Astro uses Vite natively) and `apps/web` (Next.js 16 uses
the same plugin via next.config).

### Reason
Tailwind 4 is the current major version. The Vite plugin avoids PostCSS
configuration entirely. Aligns with where the rest of the JS ecosystem is
heading.

### Tradeoffs
None significant. Tailwind 4 has minor breaking changes from v3 (documented
in their migration guide); new projects start clean.

---

## ADR-004: pnpm as the only package manager
Date: 2026-05-02
Status: Accepted

### Decision
Use pnpm exclusively. Never commit `package-lock.json` or `yarn.lock`. The
`packageManager` field in the root `package.json` pins the pnpm version.

### Reason
- Faster, disk-efficient (content-addressed store, hard-linked).
- Strict by default — no phantom hoisted dependencies.
- A previous project shipped both `pnpm-lock.yaml` AND `package-lock.json`;
  the lockfiles drifted between local and CI builds. One lockfile eliminates
  that class of bug.

### Tradeoffs
- Some npm-only tooling occasionally has pnpm-incompatibility quirks.
  Resolved case-by-case.

---

## ADR-005: Azure Static Web Apps with managed Functions API
Date: 2026-05-02
Status: Superseded by ADR-013

**Superseded.** Fortress uses **Azure Container Apps** for `apps/api` and
`apps/worker` (full NestJS + BullMQ processes require a persistent container
runtime, not a serverless functions model). `apps/web` (Next.js 16 SSR) also
runs on Azure Container Apps. `apps/marketing` (Astro static) still uses
Azure Static Web Apps. See ADR-013 for the full hosting decision.

### Decision (original)
Deploy frontend as static files to Azure Static Web Apps. Deploy the contact
endpoint as the SWA managed API (Azure Functions v4, Node 24 LTS ESM).

### Reason (original)
Free SSL on custom domains; free tier covers small marketing sites; single
deploy artifact.

### Tradeoffs (original)
- Vendor lock to Azure. Acceptable for the marketing-site class of project.

---

## ADR-006: GitHub Actions deployment with OIDC federated auth
Date: 2026-05-02
Status: Accepted

### Decision
GitHub Actions deploys to Azure (and AWS when on the AWS module) using OIDC
federated credentials. No static service principal client secrets in the repo
or in repo secrets.

### Reason
OIDC federation is the modern Azure/AWS auth pattern: no secret to rotate, no
secret to leak. The user's existing projects already use this pattern.

### Tradeoffs
- Requires a one-time federated credential setup in Azure AD (5-minute task
  per project, per environment). Documented in `/ai/DEPLOYMENT.md`.

---

## ADR-007: Postmark + Cloudflare Turnstile + honeypot + rate limiting
Date: 2026-05-02
Status: Superseded by ADR-017

**Superseded.** Postmark remains the email provider (see ADR-017). The
contact-form pattern (Turnstile + honeypot + per-IP rate limiting on a
serverless function) does not apply to a SaaS chassis. Bot and abuse
mitigation moves to Azure Front Door WAF + per-route rate limiting in the
NestJS security middleware chain. The contact-form Azure Function concept is
dropped entirely.

### Decision (original)
Contact form uses Postmark for delivery, Cloudflare Turnstile for bot
mitigation, an unrendered honeypot field, and per-IP rate limiting.

### Reason (original)
Postmark: reliable transactional delivery. Turnstile: invisible-by-default,
privacy-respecting. Honeypot + rate limit: cheap defense in depth.

### Tradeoffs (original)
- Two third-party services to maintain.

---

## ADR-008: TypeScript strict, ESM only, ES2023 target
Date: 2026-05-02 (updated 2026-05-08)
Status: Accepted

### Decision
All new code is TypeScript with strict mode (`noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`). ESM only — no CommonJS `require()`. Compilation
target **ES2023** (updated from ES2022 to align with Node 24+ and the Fortress
stack's minimum engine requirements).

### Reason
Strict TS catches real bugs cheaply. ESM is the JS standard; CJS is legacy.
ES2023 covers Node 24+ and modern browsers without polyfill noise. ES2023 is
the higher of the two targets mentioned in the spec and is preferred.

### Tradeoffs
- Some older npm packages still ship CJS-only. Resolved per-package; if
  truly stuck, document in an ADR.

---

## ADR-009: Vitest 4 + supertest + Playwright for testing
Date: 2026-05-02 (updated 2026-05-08)
Status: Accepted

### Decision
Use Vitest 4 as the primary test runner for unit and integration tests.
Use **supertest** for NestJS API integration tests (tests the real NestJS DI
container over HTTP without a live network). Use **Playwright** for web E2E
smoke tests (covers the Clerk sign-up → app → sign-out happy path).

No Jest, no Mocha. One runner family per concern.

### Reason
- Vitest: native ESM support, Vite-based, fast, one config, shares the build.
- supertest: the standard for NestJS integration testing; tests the full
  middleware chain without a real HTTP server.
- Playwright: most reliable E2E runner for Next.js / React; supports Clerk
  dev-mode testing out of the box.

### Tradeoffs
- Playwright adds a Chromium dependency to CI. Mitigated by pinned container
  images and separate CI job.

---

## ADR-010: CI runs on push and pull_request, not workflow_dispatch
Date: 2026-05-02
Status: Accepted

### Decision
The CI workflow (`ci.yml`) is `on: [push, pull_request]`. It is NOT
`workflow_dispatch`-only. Quality gates fire on every PR and merge to main.

### Reason
A previous project had `ci.yml` set to `workflow_dispatch` only, which meant
test failures only surfaced during deploys — past the point where they should
have blocked the merge. Standard CI hygiene says gates run on PRs.

### Tradeoffs
- Slightly more Actions minutes consumed. Negligible at this scale.

---

## ADR-011: Clerk as identity provider
Date: 2026-05-08
Status: Accepted

### Decision
Use Clerk as the identity provider for B2C consumer authentication. Clerk
handles sign-up, sign-in, social providers, magic links, passkeys (WebAuthn),
MFA, and user profile management UI. The API verifies Clerk-issued JWTs against
Clerk's JWKS; the web app uses the Clerk Next.js SDK.

Stytch is documented as a swap: the Clerk integration points are isolated in
`apps/web/src/auth/` and the API reads only standard JWT claims verified
against a JWKS endpoint.

### Reason
- Clerk offers native passkey support, prebuilt customizable UI components,
  and strong B2C DX — all production-ready without custom auth scaffolding.
- JWKS-based verification means the API is decoupled from Clerk-specific SDKs.
- Stytch swap is documented so the template isn't permanently vendor-locked.

### Tradeoffs
- Clerk is a paid SaaS (generous free tier). Cost scales with MAU.
- Clerk's session UX is owned by Clerk; our API adds a server-side audit layer
  on top (see ADR-021) to maintain revocation and audit control.

### Related Tasks
See Phase 3 tasks (web skeleton with Clerk integration).

---

## ADR-012: Drizzle as the ORM
Date: 2026-05-08
Status: Accepted

### Decision
Use Drizzle 0.45+ as the ORM for all database access in `apps/api` and
`apps/worker`. Schema is defined in TypeScript; migrations are Drizzle-managed,
forward-only by default.

### Reason
- No codegen: schema and types are the same TypeScript file. AI scaffolding
  agents can read and write Drizzle schema without a separate generation step.
- Type-safe SQL: queries are composed as type-safe builders, not raw strings.
- Lightweight: no heavyweight ORM abstractions; SQL is still readable in traces.

### Tradeoffs
- Less ecosystem tooling than TypeORM or Prisma. Acceptable given the
  AI-scaffolder-friendly goal.
- Complex joins require explicit builder syntax (not magic eager-loading).
  Documented as expected behavior.

### Related Tasks
See Phase 2 tasks (API skeleton) and Phase 1 tasks (`packages/types`).

---

## ADR-013: Azure as primary cloud; AWS as parallel swap module
Date: 2026-05-08
Status: Accepted

### Decision
Azure is the **primary** cloud target. Terraform Azure modules are shipped and
maintained as the default. AWS modules are shipped **in parallel** as a
documented swap — a fork can switch clouds by pointing at the AWS module set
without re-architecting the application layer.

Hosting shape:
- `apps/api` + `apps/worker` + `apps/web` → Azure Container Apps
- `apps/marketing` → Azure Static Web Apps (or Cloudflare Pages)
- Database → Azure DB for PostgreSQL Flexible Server (private subnet)
- Cache/queue → Azure Cache for Redis (Premium, private endpoint)
- Storage → Azure Blob Storage
- Secrets → Azure Key Vault
- Edge → Azure Front Door + WAF
- DNS → Azure DNS + managed certs

### Reason
- User preference: existing Azure footprint and comfort level.
- Azure Container Apps is the right fit for NestJS + BullMQ (persistent processes,
  auto-scaling, managed certs, no Kubernetes overhead).
- AWS module added in parallel because many teams switch from Azure to AWS or
  need to support both.

### Tradeoffs
- Two cloud module sets to maintain. AWS module must stay in sync with Azure.
  Mitigated by shared Terraform module interface.

### Related Tasks
See Phase 6 tasks (Terraform infra).

---

## ADR-014: SOC 2 + GDPR-friendly compliance baseline; HIPAA/PCI as add-ons
Date: 2026-05-08
Status: Accepted

### Decision
The template targets a **SOC 2 Type II + GDPR-friendly** baseline by default.
HIPAA (BAA, PHI handling) and PCI DSS (cardholder data) are documented as
explicit opt-in add-ons requiring additional controls; they are NOT in scope
for the base template.

### Reason
- SOC 2 + GDPR covers the vast majority of B2C SaaS compliance requirements.
- HIPAA/PCI require data-flow changes (PHI segregation, CDE scope reduction)
  that are product-specific, not template-level concerns.

### Tradeoffs
- A fork building a health or payment product must add the appropriate controls
  before handling regulated data. Documented in `docs/compliance/`.

### Related Tasks
See Phase 7 tasks (docs, compliance, DSAR runbooks).

---

## ADR-015: Single-tenant by default; multi-tenant upgrade documented as runbook
Date: 2026-05-08
Status: Accepted

### Decision
The template ships single-tenant: one row per user, no `tenant_id` column
scaffolding, authorization is per-user. A `docs/runbooks/upgrade-to-multitenant.md`
runbook documents the migration path (adding `tenants` + `tenant_users` tables,
RLS policies, session propagation) but is NOT automated.

### Reason
- Most early-stage consumer SaaS products start single-tenant and only add
  multi-tenancy when there is a business case (team plans, enterprise).
- Scaffolding multi-tenancy upfront adds complexity the template does not need.
- The runbook ensures the upgrade path is documented and testable when needed.

### Tradeoffs
- A fork building a B2B or team-based product must follow the upgrade runbook
  before launching. This is intentional scope control.

### Related Tasks
See Phase 7 tasks (multi-tenant upgrade runbook).

---

## ADR-016: Astro for the marketing site on a separate subdomain
Date: 2026-05-08
Status: Accepted

### Decision
The marketing site (`apps/marketing`) uses **Astro** and runs on the `www`
subdomain, strictly isolated from the app (`app` subdomain) and API (`api`
subdomain). Cookie scope, CSP, and analytics are per-subdomain. The app and
API subdomains do not load marketing scripts; the marketing subdomain does not
have access to app cookies.

### Reason
- Astro produces minimal-JS static output ideal for marketing (SEO, Lighthouse,
  CDN-friendliness).
- Subdomain isolation is a hard security requirement: marketing analytics
  (Plausible, GTM, etc.) must not be able to read app cookies or make
  credentialed requests to the API.
- Decouples deployment cadences: marketing can deploy independently of app.

### Tradeoffs
- Three deploy targets instead of one. Mitigated by Turbo's monorepo task
  graph and separate GitHub Actions workflows.

### Related Tasks
See Phase 5 tasks (marketing site).

---

## ADR-017: Postmark for transactional email; Resend documented as swap
Date: 2026-05-08
Status: Accepted

### Decision
Use Postmark for all transactional email (`apps/worker`). Maintain separate
Postmark streams for transactional and broadcast. DKIM, SPF, DMARC setup
documented in `docs/runbooks/email-domain-setup.md`. Bounce/complaint webhooks
handled by `apps/worker`; suppression list backed by the database.

Resend is documented as a swap: the Postmark client is isolated in
`apps/worker/src/email/` with a provider interface.

### Reason
- Postmark has best-in-class deliverability for transactional email.
- Stream separation (transactional vs. broadcast) is required for compliance
  (marketing unsubscribes must not suppress transactional emails).
- Resend swap path ensures the template is not permanently vendor-locked.

### Tradeoffs
- Postmark is paid above ~100 emails/month (free tier). Cost scales with volume.
- Bounce/complaint webhook handler adds worker complexity. Worth it for
  deliverability reputation management.

### Related Tasks
See Phase 4 tasks (worker skeleton with Postmark welcome email).

---

## ADR-018: Unleash self-hosted + OpenFeature SDK for feature flags
Date: 2026-05-08
Status: Accepted

### Decision
Use **Unleash** (self-hosted, docker-compose in dev, Container App in prod)
as the feature flag backend. Integrate via the **OpenFeature SDK** — application
code calls the OpenFeature API, not Unleash directly. The Unleash provider is
swappable at the OpenFeature layer.

### Reason
- OpenFeature is an open standard (CNCF project); application code is not
  coupled to any specific flag vendor.
- Unleash self-hosted avoids per-seat / per-flag pricing. The local dev
  docker-compose instance starts in seconds.
- Stripe billing is the first feature gated behind a flag (off by default in
  the template).

### Tradeoffs
- Hosting Unleash adds an operational dependency. Mitigated by the
  docker-compose service for local dev and a Container App for prod.
- OpenFeature adds an abstraction layer. Minimal overhead; worth the
  vendor-neutrality.

### Related Tasks
See Phase 0 tasks (docker-compose includes Unleash service) and Phase 2
(API skeleton wires the OpenFeature provider).

---

## ADR-019: Sentry for error tracking with PII scrubbing on by default
Date: 2026-05-08
Status: Accepted

### Decision
Use **Sentry** for error tracking across all services (`apps/web`, `apps/api`,
`apps/worker`). PII scrubbing is configured on by default:
- `sendDefaultPii: false` in all Sentry SDK initializations.
- Custom `beforeSend` hook to scrub known PII field names from breadcrumbs
  and event contexts.
- Request body scrubbing enabled.

### Reason
- Sentry is the industry standard for structured error tracking with full
  stack traces, release tracking, and alerting.
- PII scrubbing on by default ensures GDPR compliance without per-developer
  vigilance.

### Tradeoffs
- Sentry is a paid SaaS (generous free tier). Cost scales with event volume.
- PII scrubbing may strip legitimate debugging context; tuning the scrub list
  is a per-fork maintenance task. Documented in `docs/compliance/gdpr.md`.

### Related Tasks
See Phase 1 tasks (`packages/observability` sets up Sentry SDK with defaults).

---

## ADR-020: Grafana Tempo via OTLP for tracing; Azure Monitor as log/metric sink
Date: 2026-05-08
Status: Accepted

### Decision
Use **OpenTelemetry** (vendor-neutral) as the instrumentation standard across
all services. Ship traces to **Grafana Tempo** via OTLP. Ship logs and metrics
to **Azure Monitor + Log Analytics workspace** as the primary sink. Sentry
receives errors independently (see ADR-019).

### Reason
- OpenTelemetry ensures no vendor lock-in for tracing/metrics instrumentation.
- Grafana Tempo is open-source, self-hostable, and integrates cleanly with
  Grafana dashboards.
- Azure Monitor is the natural log/metric sink for an Azure-primary stack;
  it colocates logs with infra metrics without additional cost for basic tiers.

### Tradeoffs
- Two observability backends (Tempo + Azure Monitor). Mitigated by the
  `packages/observability` package which hides this complexity from app code.
- Grafana Tempo requires hosting (self-hosted or Grafana Cloud). This is an
  infrastructure decision documented in Phase 6.

### Related Tasks
See Phase 1 tasks (`packages/observability`) and Phase 6 (Terraform infra
includes Grafana Tempo or Grafana Cloud wiring).

---

## ADR-021: Server-side opaque audit/session record on the API
Date: 2026-05-08
Status: Accepted

### Decision
Even though Clerk owns the user-facing authenticated session (JWT, passkey,
MFA), the API maintains its own server-side **session/audit record** in Postgres
for every authenticated request. This record stores:
- Hashed Clerk session token (for revocation lookup)
- Last-seen timestamp
- Hashed IP address and User-Agent (for anomaly detection)
- Current step-up authentication state
- Session metadata (device fingerprint, etc.)

The API creates or refreshes this record on every verified request (via an
upsert, not a per-request insert).

### Reason
- **Revocation:** Clerk's session lifetime is not under our control. Our record
  allows immediate server-side revocation (e.g., on account compromise) without
  waiting for the Clerk JWT to expire.
- **Audit:** SOC 2 / GDPR require an auditable record of every privileged action.
  Clerk's logs are external; our `audit_events` table is ours.
- **Step-up auth:** Sensitive operations (delete account, billing change, DSAR
  export) require a step-up state (`stepped_up_at` within last 5 minutes).
  This state must live on the API's session record, not Clerk's JWT.
- **Clean swap path:** If we switch identity providers, the API side changes
  only the JWKS verification endpoint — all revocation, audit, and step-up
  logic is provider-agnostic.

### Tradeoffs
- Clerk effectively owns more session UX than a strict "we own everything"
  rule implies. This is a deliberate B2C DX trade-off: Clerk's prebuilt
  components are worth the reduced raw session control for consumer products.
- The upsert on every request adds a DB write per API call. Mitigated by
  using a Redis-backed session cache for step-up state (the Postgres record
  is the source of truth; Redis is the hot cache).

### Related Tasks
See Phase 2 tasks (API skeleton, session/audit record service) and Phase 3
(web skeleton, step-up flow).

---

## ADR-022: Two-stage kickoff session pattern
Date: 2026-05-08
Status: Accepted

### Decision
The canonical way to bootstrap this template into a usable state is the
**two-stage kickoff session** defined in `/KICKOFF_PROMPT.md`:

- **Stage 1 (this session):** Realign `/ai/` planning files from the
  `ai-starter` baseline to the Fortress stack. No application code. Commit
  and push. Stop for human approval.
- **Stage 2 (next session, after approval):** Produce the Phase 0 task
  breakdown and phase manifest (`/ai/TASKS.md` P0-T1 through P0-T8,
  `/PHASE_MANIFEST.md`, `/phase-manifest.json`). No application code. Commit
  and push. Stop.

Each subsequent phase (0 through 8) is its own AI session, gated by human
approval of the previous phase's verification evidence.

### Reason
- Prevents the AI from starting application code before the planning files
  accurately describe the intended stack.
- The stage gate after Stage 1 lets the human review the full ADR set and
  planning realignment before any code is written.
- Mirrors the broader phase-gated pattern in `NEW_TEMPLATE_PROMPT.md` but
  adds the explicit "realign before executing" gate unique to bootstrapping
  a template from a different starter.

### Tradeoffs
- Adds one extra session (Stage 1) that a greenfield project would not need.
  This is intentional: the `ai-starter` baseline must be explicitly realigned,
  not silently overwritten.

### Related Tasks
All Phase 0 tasks (populated in Stage 2).

---

## ADR-023: `typescript` at workspace root for Phase 0 config packages
Date: 2026-05-09
Status: Accepted

### Decision
Add **`typescript`** (pinned in root `devDependencies`) as the single workspace-wide
compiler for validating shared configs (e.g. `@fortress/config-typescript`) and
for future app packages to align on one version via hoisting.

### Reason
`@fortress/config-typescript` must run `tsc --version` / `tsc --noEmit` in CI and
locally without each consumer duplicating the dependency before apps exist.

### Tradeoffs
- Root owns the version pin; bumping TypeScript is a repo-wide choice (intended).

### Related Tasks
P0-T2 (shared `tsconfig` package), later Phase 1+ packages and apps.

---

## ADR-024: ESLint 9 flat stack for `@fortress/config-eslint`
Date: 2026-05-09
Status: Accepted

### Decision
Phase 0 shared lint package **`@fortress/config-eslint`** depends on **`eslint` 9**,
**`typescript-eslint`** (strict type-checked presets + project service),
**`@eslint/js`**, **`@eslint/eslintrc`** + **`@eslint/compat`** (FlatCompat for
`eslint-config-next`), **`eslint-config-next`** (Next.js Core Web Vitals rules),
**`eslint-plugin-n`** (Node recommended flat rules), and **`globals`** (Node
globals for the Node preset). Consumers use **`peerDependencies`** `eslint` and
`typescript`.

### Reason
TASKS P0-T3 requires type-checked `@typescript-eslint` rules, Next and Node
presets, and self-lint of the config package without per-app `eslint.config.js`
in Phase 0.

### Tradeoffs
`eslint-config-next` is still consumed via compatibility layer until the monorepo
pins a Next app and can revisit native flat-only Next config.

### Related Tasks
P0-T3; Phase 1+ apps will extend these presets.

---

## ADR-025: Phase 1 shared package runtime + test stack
Date: 2026-05-09
Status: Accepted

### Decision
Phase 1 library packages use **Vitest 4** for smoke tests, **Zod 4** in `@fortress/sdk`, **Pino 10** in
`@fortress/observability`, and **`typescript-eslint` 8** as an explicit `devDependency` on each package that
ships an `eslint.config.js` (pnpm isolated `node_modules`; configs cannot rely on transitive resolution from
`@fortress/config-eslint` alone). Root **`@types/node` ~24** supports `compilerOptions.types: ["node"]` in packages
that import Node built-ins. **`@fortress/sdk`** declares **`engines.node` >= 24.15.0** so `eslint-plugin-n`
treats `fetch` / `Response` as supported. Dual **tsconfig**: `tsconfig.json` (`noEmit`, all `src/**/*.ts`
including tests) and `tsconfig.build.json` (emit `dist/`, exclude `*.test.ts`).
Aligns with ADR-009 (Vitest), template stack (Zod 4, Pino), strict TypeScript presets, and reproducible CI.
pnpm strictness required hoisting `typescript-eslint` for ESLint flat configs importing `typescript-eslint`.

### Tradeoffs
Minor duplication of `devDependencies` across six packages; bumping Vitest/Zod is repo-wide maintenance.

### Related Tasks
P1-T1–P1-T6

---

## ADR-026: Migration to native Ubuntu 26 LTS development environment
Date: 2026-05-10 (originally written 2026-05-09 as ADR-023; restored after
CHAT_END reconciliation loss — see ADR-001 number-history note)
Status: Accepted
Supersedes: ADR-001 (WSL-native development, no Docker for app code)

### Decision
All development for this template — and for any product forked from it —
happens on a dedicated **Ubuntu 26 LTS** development host. The host is
reserved for software development with Claude Code, Cursor CLI, and GitHub
Copilot CLI. WSL on Windows is no longer used.

This template uses `docker-compose up -d` at the repo root to host the full
set of supporting services for local development: Postgres 18, Redis 8,
mailpit (SMTP testing), Azurite (Blob testing), and Unleash (feature flags).
Apps (`apps/web`, `apps/api`, `apps/worker`, `apps/marketing`) still run as
native Node processes via `pnpm dev` orchestrated by Turbo. The principle
inherited from ADR-001 — no Docker for the *application* itself — holds; the
docker-compose carve-out is for supporting services only.

The repo lives at `~/repos/<project>` on the Ubuntu host. Windows paths
(`C:\`, `/mnt/c`, `\\wsl.localhost\...`) must not appear in source code,
scripts, configs, or planning docs.

### Reason
- Dedicated Ubuntu hardware eliminates the WSL/Windows boundary class of bugs:
  path-translation confusion, line-ending corruption, file-watcher quirks,
  performance penalties on cross-filesystem operations.
- AI tooling (Claude Code, Cursor CLI, GitHub Copilot CLI) is first-class on
  Linux. Running natively avoids the WSL Remote round-trip and runs on the
  host's full CPU/memory.
- Server-class Ubuntu has better tooling for long-running background processes
  (systemd, journald, cgroups) than WSL Ubuntu.
- The `/mnt/c` ↔ `~/repos` path-ambiguity surface that ADR-001 was designed
  to mitigate goes away entirely.

### Tradeoffs
- Requires a working Ubuntu 26 install (one-time, documented in
  `/ai/DEV_ENVIRONMENT.md`).
- The user can no longer edit files via Windows-side editors browsing
  `\\wsl.localhost\...`. Mitigated by VS Code Remote SSH or Cursor Remote SSH
  extensions to reach the Ubuntu host from any workstation.
- Requires a network-reachable dev machine if development is done from a
  separate workstation (LAN, Tailscale, or WireGuard).
- The `setup.ps1` PowerShell variant of the setup script is no longer
  required by this template (Ubuntu-only target). Forks targeting other
  operating systems can re-introduce it via a per-project ADR.

### Related Tasks
All Phase 0 tasks were authored under this decision. The cleanup commit
that restored this ADR also removed `scripts/setup.ps1` from the repo
(Cursor produced it during P0-T6 against the spec; this ADR is the
authoritative reason it should not exist).

---

## ADR-027: `config-typescript` and `config-eslint` packaged in Phase 0, not Phase 1
Date: 2026-05-10
Status: Accepted

### Decision
The shared TypeScript config package (`@fortress/config-typescript`) and the
shared ESLint config package (`@fortress/config-eslint`) are scaffolded in
**Phase 0** as tasks P0-T2 and P0-T3, not in Phase 1 as the original spec
listed them. The remaining six shared packages (`types`, `crypto`,
`auth-core`, `observability`, `sdk`, `testing`) are scaffolded in Phase 1.

### Reason
- The Phase 0 verification step requires `pnpm install && pnpm typecheck &&
  pnpm lint` to pass. That requires shared `tsconfig` and ESLint configs to
  exist before the workspace can be type-checked or linted.
- Decoupling the config packages from the runtime packages lets Phase 1
  focus on application-relevant code (crypto, auth helpers, SDK schemas)
  rather than tooling plumbing.
- Originally documented implicitly by Stage 2 of the kickoff (the
  decomposition that put config packages at P0-T2/T3); promoted to an
  explicit ADR after the Phase 0+1 review surfaced the spec divergence.

### Tradeoffs
- The spec at `/ai/reference/NEW_TEMPLATE_PROMPT.md` Phase plan section
  lists all eight `packages/*` under Phase 1. That section now describes
  intent, not the actual decomposition; the canonical decomposition is
  TASKS.md / DONE_LOG.md / DECISIONS.md.
- Phase 0 task count is 8 (not 6), Phase 1 task count is 6 (not 8). The
  total (14 tasks across two phases) is the same as the spec.

### Related Tasks
P0-T2, P0-T3 (Phase 0 config packages); P1-T1 through P1-T6 (Phase 1
runtime packages).

---

## ADR-028: API inbound security stack (helmet, ioredis, express) for P2-T4
Date: 2026-05-10
Status: Accepted

### Decision
Phase 2 task **P2-T4** adds **`helmet@8.1.0`**, **`ioredis@5.8.2`**, a direct
**`express@5.2.1`** dependency (for typed `express.json` body limits aligned with
**`@nestjs/platform-express@11.1.19`**), and **`@types/express@5.0.6`** on **`apps/api`**.
Rate limiting uses a fixed window per Redis key (IP + placeholder session bucket);
the template spec mentioned a “token bucket” — this implementation uses increment +
TTL at a 60s window (see **`RATE_LIMIT_*`** in **`apps/api/src/security/constants.ts`**).

### Reason
- **Helmet** is the maintained baseline for security headers; Helmet 8’s bundled
  **`helmet()`** omits Permissions-Policy, so the API sets **`Permissions-Policy`**
  explicitly after Helmet in **`headers.middleware.ts`**.
- **Redis** is required for shared rate-limit state across workers; **P2-T5** reuses
  the same **`FORTRESS_REDIS`** provider.
- **Express** is declared explicitly so middleware can call **`express.json`**
  with per-route byte limits discovered from **`@AllowLargeBody`** metadata without
  relying on transitive-only imports for types.

### Tradeoffs
- Fixed-window counters are simpler than a strict token bucket; abusive traffic
  near a window edge can send slightly more than the nominal rate. Acceptable
  for the template; product forks can swap the guard implementation while
  keeping **`@AuthRoute()`** / **`x-fortress-session-id`** keying contract.
- **`req.path`** can be empty under some Express/Nest edge cases; the dynamic
  JSON middleware keys limits off **`req.originalUrl`** (pathname), matching
  **`BodyLimitRegistry`** route keys.

### Related Tasks
P2-T4 (security middleware chain); P2-T5 (session-aware rate limit refinement).

---

## ADR Template

## ADR-XXX: Title
Date: YYYY-MM-DD
Status: Proposed | Accepted | Rejected | Superseded

### Decision
TBD

### Reason
TBD

### Tradeoffs
TBD

### Related Tasks
TBD
