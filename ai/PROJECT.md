# Project

Last Updated: 2026-05-08

## Project Name
Fortress Template

## Application Description
A forkable, security-first, production-grade SaaS chassis for consumer-facing
B2C single-tenant applications. Forks become real products; the template itself
contains no business logic — only the infrastructure, security baseline, and
architectural skeleton every SaaS product needs before the first line of product
code is written.

## Problem Being Solved
Starting a new SaaS means re-litigating dozens of architectural and security
decisions every time: which identity provider, which ORM, which cloud, how to do
CSRF, where secrets live, what compliance baseline to target. This template makes
those decisions once — vetted, documented, and wired up — so a fork plus a
follow-up AI scaffolding pass can produce a real application without touching
architecture.

## Target Users
Tommy (primary) and any future contributors building consumer SaaS products on the
Fortress stack.

## Primary Goals
- Ship a working, CI-green monorepo chassis matching the spec in
  `/ai/reference/NEW_TEMPLATE_PROMPT.md`.
- Ensure `pnpm setup && pnpm dev` boots the full stack on a clean machine in under
  5 minutes.
- Ensure a fork + AI scaffolding pass can produce a real application without
  re-litigating any of the 10 locked decisions.
- Produce full runbooks for incident response, DR/restore, key rotation, secret
  rotation, DSAR export/delete, multi-tenant upgrade, and email domain setup.

## Explicit Non-Goals
- Business logic: no product features, no product-specific routes or schemas.
- Real credentials: placeholder values only; users supply real values on fork.
- Mobile apps.
- Multi-tenant scaffolding: documented runbook only, not auto-migration.
- ML/AI features.
- Public API documentation site (OpenAPI is generated; hosting is per-fork).

---

## Default Tech Stack

| Concern | Choice |
|---|---|
| Language | TypeScript 6.x strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` |
| Package manager | pnpm 10.x |
| Monorepo orchestration | Turbo 2.x |
| Marketing | Astro (static, edge-hosted, separate subdomain) |
| Web app | Next.js 16 App Router + React 19 + Tailwind 4 |
| API | NestJS 11 |
| ORM | Drizzle 0.45+ |
| Database | Postgres 18 (Azure DB for PostgreSQL Flexible Server) |
| Cache / queue | Redis 8 (Azure Cache for Redis) + BullMQ |
| Identity | Clerk (B2C-optimized; Stytch documented as swap) |
| Validation | Zod 4 (at every inbound boundary) |
| Styling | Tailwind 4 via the `@tailwindcss/vite` plugin |
| Testing | Vitest 4 + supertest + Playwright |
| Linting | ESLint 10 + typescript-eslint (type-checked rules) |
| Formatting | Prettier 3 |
| Logging | Pino + nestjs-pino |
| Tracing | OpenTelemetry → OTLP → Grafana Tempo |
| Metrics | Prometheus client + OTel |
| Errors | Sentry (PII scrubbing on by default) |
| Email | Postmark (Resend documented as swap) |
| Object storage | Azure Blob Storage |
| Billing | Stripe (wired, feature-flagged off by default) |
| Feature flags | Unleash (self-hosted) + OpenFeature SDK |
| Cloud | Azure (primary), AWS (parallel module) |
| IaC | Terraform (Azure + AWS module sets) |
| Secrets | Azure Key Vault (Azure) / AWS Secrets Manager (AWS) |

---

## Repository Structure

```
fortress-template/
├── apps/
│   ├── marketing/              # Astro — static, www subdomain
│   ├── web/                    # Next.js 16 App Router, app subdomain
│   ├── api/                    # NestJS 11, api subdomain
│   └── worker/                 # BullMQ consumer
├── packages/
│   ├── sdk/                    # Typed HTTP client + Zod schemas (web↔api contract)
│   ├── types/                  # Domain types and Zod schemas (no runtime deps)
│   ├── ui/                     # Shared React components, design system tokens
│   ├── config-typescript/      # Shared tsconfig bases (base, next, node, library)
│   ├── config-eslint/          # Shared ESLint configs (base, next, node)
│   ├── crypto/                 # AES-256-GCM, HMAC, key versioning helpers
│   ├── auth-core/              # Session/audit record, CSRF, __Host- cookie helpers
│   ├── observability/          # Logger, tracer, metrics — one import per app
│   └── testing/                # Test harness, factories, fixtures
├── infra/
│   └── terraform/
│       ├── modules/
│       │   ├── azure/          # PRIMARY: container-apps, postgres, redis, blob, etc.
│       │   └── aws/            # PARALLEL swap: ecs-fargate, rds, elasticache, etc.
│       └── environments/
│           ├── dev/
│           ├── staging/
│           └── prod/
├── docs/
│   ├── index.md
│   ├── architecture.md
│   ├── security.md             # STRIDE threat model
│   ├── runbooks/
│   ├── compliance/             # SOC 2, GDPR, retention
│   ├── adrs/                   # Architecture Decision Records
│   └── legal/                  # Privacy policy + ToS templates
├── scripts/
│   ├── setup.sh
│   ├── rotate-keys.ts
│   └── new-migration.ts
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy-staging.yml
│   │   ├── deploy-prod.yml
│   │   └── codeql.yml
│   ├── dependabot.yml
│   └── CODEOWNERS
├── .well-known/
│   └── security.txt
├── docker-compose.yml
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
├── AGENTS.md
├── PROJECT_STATUS.md
└── README.md
```

---

## Non-Negotiables

1. The web app never touches the database directly. All persistence flows through the API.
2. Server-side audit/session record on the API for every authenticated request.
3. Secrets never in code or repo. Local: generated `.env`; CI: encrypted vars; prod: Azure Key Vault.
4. All inbound boundaries validated with Zod. No exceptions.
5. All sensitive data at rest encrypted with AES-256-GCM. Keys versioned in Key Vault.
6. TLS 1.3 only. HSTS with preload.
7. Marketing site on a separate subdomain. Cookie scope, CSP, analytics isolated.
8. CSRF protection on all state-changing API requests. Double-submit token, `__Host-` prefix.
9. Every privileged action is auditable. Append-only `audit_events` table.
10. CI gates merges. Lint, typecheck, tests, dep audit, secret scan, SAST, SBOM. Red CI = no merge.

## AI Instructions

When working in this repository, use the Fortress stack from the table above. Do NOT
change the stack unless the user explicitly requests it and an ADR is written first.
Preserve all cross-project files in `/ai/`. Update `/ai/` planning files after every
meaningful change. Do not reference the old Astro + SWA + contact-form pattern — those
ADRs are superseded. Refer to `/ai/reference/NEW_TEMPLATE_PROMPT.md` for the
authoritative spec whenever a decision question arises.
