# Fortress Template

Last Updated: 2026-05-08

A forkable, security-first, production-grade SaaS chassis for consumer-facing
B2C single-tenant applications built on the TypeScript full-stack.

## Repository status

This repository **is the template itself**, not an application. When you fork
it and run the kickoff prompt in a fresh AI CLI session, you get a real
application repository with the architectural skeleton, security baseline, and
tooling already decided. The fork's AI pass adds product-specific routes,
schemas, and UI on top — without re-litigating any of the decisions below.

## How to use

1. Click "Use this template" (or `git clone` + set a new remote).
2. Open an AI CLI session (Claude Code, Cursor CLI) with the working directory
   set to the new repo root on your Ubuntu dev host.
3. Paste the contents of `/KICKOFF_PROMPT.md` and run Stage 1 (planning
   realignment) followed by Stage 2 (Phase 0 task breakdown).
4. Execute Phase 0 onward via `./run-phase.sh <task-count>` or task-by-task
   interactive sessions per `/ai/HANDOFF.md`.

## What's baked in

The 10 locked decisions (non-negotiable without a written ADR):

| # | Decision | Choice |
|---|---|---|
| 1 | Identity provider | Clerk (Stytch documented as swap) |
| 2 | ORM | Drizzle |
| 3 | Cloud (primary) | Azure with Terraform (AWS module in parallel) |
| 4 | Compliance baseline | SOC 2 + GDPR-friendly defaults; HIPAA/PCI as explicit add-ons |
| 5 | Tenancy | Single-tenant (multi-tenant upgrade runbook included) |
| 6 | Marketing framework | Astro |
| 7 | Email | Postmark (Resend documented as swap) |
| 8 | Feature flags | Unleash (self-hosted) + OpenFeature SDK |
| 9 | Error tracking | Sentry (PII scrubbing on by default) |
| 10 | Tracing backend | Grafana Tempo via OTLP; Azure Monitor as log/metric sink |

Additional baked-in choices: Next.js 16 App Router (web), NestJS 11 (API),
Postgres 18 + Redis 8 (data), BullMQ (worker), Tailwind 4, Vitest 4 +
supertest + Playwright, ESLint 10, Prettier 3, Pino + OpenTelemetry, Stripe
(feature-flagged off), pnpm 10, Turbo 2, Azure Container Apps + Static Web
Apps + Key Vault, Terraform.

## What's NOT baked in

- Real Clerk credentials, OAuth provider configs — placeholder values only;
  you supply real values on fork.
- Domain registration, DNS records, SSL certificates — infra wires them; you
  provide the domain.
- Real Stripe products or prices — test-mode placeholders only.
- Mobile apps.
- ML/AI features.
- Multi-tenant scaffolding — deferred to `docs/runbooks/upgrade-to-multitenant.md`.

## Single rule

Read **`/ai/START_HERE.md`** first. Everything else flows from there.

## Refreshing this template

If an existing fork has drifted from current conventions, point an AI
assistant at `/ai/templates/REFRESH_PROMPT.md`.

> **Note:** `REFRESH_PROMPT.md` was inherited from the `ai-starter` predecessor
> and will be updated to be Fortress-aware in a future pass. See
> `PROJECT_STATUS.md` for the tracking flag once it is created in Phase 0.
