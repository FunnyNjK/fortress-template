# Architecture

Last Updated: 2026-05-08

## Architecture Status
Fortress Template chassis — Phase 0 not yet started. All components are planned;
no application code exists yet.

---

## System Overview

Three internet-facing properties on three separate subdomains, with strict
layer boundaries enforced by architecture rules (not just convention).

```
Internet
    │
    ▼
Azure Front Door (WAF, DDoS, TLS 1.3 only, bot management)
    │
    ├── www.example.com  → apps/marketing  (Astro static, Azure Static Web Apps)
    │
    ├── app.example.com  → apps/web        (Next.js 16 SSR, Azure Container Apps)
    │         │  Clerk session JWT
    │         ▼
    └── api.example.com  → apps/api        (NestJS 11, Azure Container Apps)
                               │
                               ├── Postgres 18  (private subnet, PgBouncer pooler)
                               ├── Redis 8      (private endpoint, Azure Cache)
                               ├── Azure Blob   (private, signed SAS URLs only)
                               └── apps/worker  (BullMQ, separate Container App)
                                       │
                                       └── Postmark (transactional email)

Identity:    Clerk → JWT → apps/web → apps/api → verify via JWKS
Observability: all services → OpenTelemetry → OTLP → Grafana Tempo
Errors:      all services → Sentry (PII scrubbing on)
Logs/metrics: all services → Pino (structured JSON) → Azure Monitor + Log Analytics
```

---

## Major Components

### `apps/marketing`
Astro static site on `www.example.com`. No auth, no DB access. Hardened CSP
(no `unsafe-inline`, no `unsafe-eval`), privacy-respecting analytics (Plausible
default; Fathom or self-hosted Umami documented as swaps), cookie consent banner,
`security.txt`. Deployed to Azure Static Web Apps or Cloudflare Pages.

### `apps/web`
Next.js 16 App Router on `app.example.com`. React 19, Tailwind 4. Handles Clerk
authentication handshake and user-facing rendering. Calls the API exclusively
through `@fortress/sdk` — never constructs raw API URLs or queries the database.

### `apps/api`
NestJS 11 on `api.example.com`. **Sole owner** of the database, business rules,
authorization, encryption, and audit logging. Verifies Clerk JWTs via JWKS on
every request. Runs the security middleware chain. Upserts a server-side
session/audit record on every authenticated request.

### `apps/worker`
BullMQ consumer. Separate process and scaling unit. Handles email sends
(Postmark), async jobs, webhook delivery, scheduled tasks. Idempotent job IDs,
exponential backoff, dead-letter queue with alerting.

### `packages/sdk`
Typed HTTP client and Zod schemas. The `apps/web` ↔ `apps/api` contract.
`apps/web` imports only from `@fortress/sdk` — never constructs API URLs directly.

### `packages/types`
Domain types and Zod schemas. No runtime dependencies. Shared across all
packages and apps.

### `packages/crypto`
AES-256-GCM helpers, HMAC helpers, key versioning utilities. Used by `apps/api`
for at-rest column encryption.

### `packages/auth-core`
Session/audit record creation, password/token hashing, CSRF token helpers,
`__Host-` cookie utilities. Used by `apps/api`.

### `packages/observability`
Logger (Pino), tracer (OpenTelemetry SDK), metrics (Prometheus client). One
import per app. Centralizes configuration so all services emit consistent
structured logs and traces.

### `packages/ui`
Shared React components and design system tokens. Used by `apps/web`.

### `packages/config-typescript`
Shared `tsconfig` bases: `base.json`, `next.json`, `node.json`, `library.json`.
Strict mode, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, ES2023.

### `packages/config-eslint`
Shared ESLint configs: `base.js`, `next.js`, `node.js`. Type-checked rules,
`no-floating-promises`, `consistent-type-imports`.

### `packages/testing`
Test harness, factories, fixtures. Shared by all test suites.

### `infra/terraform/modules/azure`
Primary IaC: Container Apps (api, worker, web), Postgres Flexible Server,
Azure Cache for Redis, Blob Storage, Key Vault, Front Door + WAF, Static Web
Apps (marketing), DNS zones, Monitor + Log Analytics workspace, managed
identities.

### `infra/terraform/modules/aws`
Parallel swap IaC: ECS Fargate, RDS PostgreSQL, ElastiCache Redis, S3,
Secrets Manager, CloudFront, Route 53, IAM roles, CloudWatch + X-Ray.

---

## Data Flow

### Authentication
1. User authenticates via Clerk sign-up/sign-in components in `apps/web`.
2. Clerk issues a session JWT (signed, audience-scoped).
3. `apps/web` passes the JWT on every API call via the `@fortress/sdk` client.
4. `apps/api` verifies the JWT against Clerk's JWKS (issuer, audience, signature, expiry).
5. API upserts local user record; creates/refreshes a server-side session/audit
   record in Postgres (hashed token, last-seen, hashed IP+UA, step-up state).
6. API attaches `__Host-` prefixed CSRF cookie on authenticated responses.

### Request (security middleware chain)
1. `Security headers middleware` — attaches CSP, HSTS, X-Frame-Options, etc.
2. `Body size limit` — rejects payloads above 256 KB (configurable per route).
3. `Rate limiter` — token bucket; auth routes: 20/60s; general: 120/60s; per-IP + per-session.
4. `Clerk JWT verification` — verifies token, upserts session/audit record.
5. `Zod validation pipe` — validates all inbound DTOs; rejects on schema mismatch.
6. `RolesGuard` — enforces `@RequireRoles()` decorator.
7. Business handler.
8. `Audit appender` — appends `audit_events` row (append-only, never deleted).
9. `Serialization interceptor` — class-transformer with `excludeExtraneousValues`.
10. `Exception filter` — catches all unhandled errors, returns generic codes, no leakage.

### Async (worker)
1. API enqueues BullMQ job to Redis with idempotency key.
2. `apps/worker` dequeues job; retries with exponential backoff on failure.
3. Worker calls Postmark for email sends; verifies HMAC signature on inbound webhooks.
4. Worker appends `audit_events` row for tracked actions.
5. Failed jobs after max retries → dead-letter queue → alerting via Sentry.

---

## Security Model

Full detail in `/ai/reference/NEW_TEMPLATE_PROMPT.md` "Security baseline" and
`docs/security.md` (STRIDE threat model, Phase 7).

### Network/edge
- Azure Front Door: WAF (OWASP CRS), DDoS, bot management, TLS termination.
- TLS 1.3 only; HSTS preload; OCSP stapling.
- Strict CSP per-app; no `unsafe-inline`, no `unsafe-eval`.
- Permissions-Policy: camera/mic/geolocation disabled by default.
- Standard headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`, COOP/COEP.

### API hardening
- Middleware chain described above (in order, all gates active by default).
- All controllers behind `AuthGuard` + `RolesGuard` by default; opt-out is explicit.
- Output serialization via class-transformer (`excludeExtraneousValues`).

### Data
- AES-256-GCM at rest for columns tagged `@encrypted` (custom Drizzle helper).
- Key versions tracked per row; rotation is a runbook step, not a code change.
- Soft-delete with `deleted_at`; hard-delete runbook for GDPR DSAR.
- Encrypted geo-redundant backups; 30-day retention; quarterly restore drills.

### Secrets
- Local: `.env` generated by setup script with strong randoms; `.env.example` is
  the source of truth; `.env` files are gitignored.
- CI: GitHub Actions encrypted secrets (OIDC federated auth for Azure/AWS).
- Prod: Azure Key Vault (default) / AWS Secrets Manager (AWS module).
- Startup validation rejects `replace-with-*` placeholders in production.

### Supply chain
- `pnpm audit` blocking on high/critical in CI.
- Dependabot weekly dependency updates.
- gitleaks secret scan in CI (real config, not placeholder).
- Semgrep + CodeQL SAST in CI.
- CycloneDX SBOM per build, uploaded as artifact.
- Docker images pinned by digest, not tag.

### Webhooks
- All inbound webhooks (Clerk, Stripe, Postmark) verify HMAC signature before
  any processing. Replay protection via 5-minute timestamp window.
- All outbound webhooks signed with per-recipient HMAC secret.

---

## External Services

| Service | Purpose | Notes |
|---|---|---|
| Clerk | Identity (B2C sign-up/sign-in) | JWKS verified by API; Stytch is swap |
| Postmark | Transactional email | Separate broadcast/transactional streams |
| Stripe | Billing | Feature-flagged off by default |
| Sentry | Error tracking | PII scrubbing on; all services |
| Grafana Tempo | Distributed tracing | Receives OTLP from all services |
| Azure Front Door | Edge WAF + CDN | In front of all three subdomains |
| Azure Container Apps | App runtime (api, worker, web) | Auto-scaling, managed certs |
| Azure Static Web Apps | Static hosting (marketing) | Edge-cached |
| Azure DB for PostgreSQL | Primary database | Flexible Server, private subnet |
| Azure Cache for Redis | Cache + BullMQ queue | Premium tier, private endpoint |
| Azure Blob Storage | Object storage | Private + SAS URLs |
| Azure Key Vault | Secrets + encryption keys | All prod secrets |
| Azure Monitor | Logs + metrics | Log Analytics workspace |
| Unleash | Feature flags | Self-hosted; OpenFeature SDK |

---

## Architecture Rules (Non-Negotiables)

1. `apps/web` **never** queries the database directly.
2. `apps/api` is the sole owner of all database access.
3. Server-side session/audit record required on every authenticated API request.
4. All inbound API boundaries validated with Zod before any handler logic.
5. Sensitive columns encrypted with AES-256-GCM at rest.
6. TLS 1.3 only; HSTS preload.
7. Marketing site (`apps/marketing`) on separate subdomain; CSP and cookies isolated.
8. CSRF double-submit token on all state-changing requests.
9. `audit_events` table is append-only; never deleted; never updated.
10. CI gates merges; red CI = no merge.

---

## Open Architecture Questions
None at template level. Per-product questions arise in the fork's initialization.
