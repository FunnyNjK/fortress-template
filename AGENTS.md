# AI agent rules (Fortress template)

This file governs **every** AI-assisted change on forks of this repository. If a
request conflicts with these rules, stop, document the conflict, and ask a human
before proceeding.

**Secrets never live in code or in the repository.** Use `.env` locally (never
committed), encrypted CI variables, and cloud secret stores (Azure Key Vault by
default). Do not paste live tokens, keys, or connection strings into chat,
commits, or docs.

---

## Layer responsibilities

| Layer | Role |
|-------|------|
| **Marketing (`apps/marketing`)** | Static/marketing Astro site. No auth, no database. |
| **Web (`apps/web`)** | Next.js UI and Clerk UX. Calls the API only through **`@fortress/sdk`**. |
| **API (`apps/api`)** | Sole owner of database access, business rules, encryption, and audit logging. Validates every inbound boundary (e.g. Zod). |
| **Worker (`apps/worker`)** | Async jobs (email, webhooks, schedules). No user-facing HTTP responses. |
| **Shared packages** | Types, crypto helpers, config, **`@fortress/sdk`** contract — **no** product business logic. |

Non-negotiable boundary: **the web app never touches the database directly.**
All persistence goes through the API.

---

## Locked technology decisions (do not re-litigate)

These choices are fixed for this template unless a human records a new ADR in
`/ai/DECISIONS.md`:

1. **Identity:** Clerk (Stytch documented as swap).
2. **ORM:** Drizzle.
3. **Cloud (primary):** Azure with Terraform; AWS module as parallel swap.
4. **Compliance baseline:** SOC 2 + GDPR-friendly defaults; HIPAA/PCI are add-ons.
5. **Tenancy:** Single-tenant (multi-tenant upgrade is a documented runbook).
6. **Marketing framework:** Astro.
7. **Email:** Postmark (Resend documented as swap).
8. **Feature flags:** Unleash (self-hosted) + OpenFeature SDK.
9. **Error tracking:** Sentry (PII scrubbing on by default).
10. **Tracing:** Grafana Tempo via OTLP; Azure Monitor as log/metric sink.

---

## Security & architecture invariants (non-negotiable)

1. The web app **never** touches the database directly; all persistence flows through the API/business layer.
2. **Server-side audit/session record** on the API for every authenticated request (revocation, audit, step-up).
3. **Secrets never live in code or in the repo.** Generated `.env` locally; encrypted CI vars; Key Vault / Secrets Manager in prod.
4. **All inbound boundaries are validated** (e.g. Zod at API edges and webhook ingress).
5. **Sensitive data at rest:** AES-256-GCM; keys versioned in Key Vault; rotation is runbook-driven.
6. **TLS 1.3 only** where applicable; strict transport security with preload; no plain-HTTP listeners except health behind LB.
7. **Marketing on a different subdomain** than the app (cookies, CSP, analytics isolated).
8. **CSRF protection** on state-changing API calls; double-submit pattern; `__Host-` prefix on API session cookie where specified.
9. **Every privileged action is auditable** via an append-only `audit_events` (or equivalent) trail.
10. **CI gates merges:** lint, typecheck, tests, dependency audit, secret scan, SAST, SBOM — red CI means no merge.

---

## Follow-up passes on product forks

When wiring product-specific features after forking this template:

1. Read `/ai/START_HERE.md`, `/ai/ARCHITECTURE.md`, and `/ai/TASKS.md` (or the fork’s equivalents).
2. Extend the API first for new persistence or rules; expose contracts via **`@fortress/sdk`**.
3. Keep **business logic out of** `packages/types`, `packages/crypto`, `packages/auth-core`, and similar — they are cross-cutting utilities only.
4. Record material deviations in `/ai/DECISIONS.md` after human approval.

Spec reference: `/ai/reference/NEW_TEMPLATE_PROMPT.md`.
