# Roadmap

Last Updated: 2026-05-08

## Phase Plan (9 phases, mandatory)

The scaffolding agent must not attempt to build everything in one pass. Each
phase lands in its own commit/PR with verification evidence before the next
phase begins.

| Phase | Title | Scope | Verification | Status |
|---|---|---|---|---|
| 0 | Repo skeleton | `pnpm-workspace.yaml`, `turbo.json`, root `package.json`, `.gitignore`, `.nvmrc`, `.editorconfig`, `.prettierrc`, `docker-compose.yml`, `.env.example`, `scripts/setup.{sh,ps1}`, CI workflow scaffolding (`.github/workflows/ci.yml`, `dependabot.yml`), `.well-known/security.txt`, `AGENTS.md`, `PROJECT_STATUS.md` | `pnpm install`, `pnpm typecheck`, `pnpm lint` all pass; CI green on initial commit | Ready |
| 1 | Shared packages | `packages/config-typescript`, `packages/config-eslint`, `packages/types`, `packages/crypto`, `packages/auth-core`, `packages/observability`, `packages/sdk`, `packages/testing` | Each package has smoke tests; all build, lint, and link correctly | Backlog |
| 2 | API skeleton | NestJS 11 app with env validation, security middleware chain (headers → size → rate-limit → auth → Zod → safe-log → exception filter), health endpoints, audit log table + service. No business modules yet. | API boots; security middleware chain integration test passes; rate-limit smoke test passes | Backlog |
| 3 | Web skeleton | Next.js 16 App Router with Clerk integration, layout, protected route group, calls to `@fortress/sdk` for `/auth/me`. Tailwind 4. | E2E: user signs up via Clerk, lands in app, sees "hello [name]", signs out | Backlog |
| 4 | Worker skeleton | BullMQ consumer with one example idempotent job (welcome email via Postmark). Dead-letter queue with alerting. | Worker consumes a test job; retry/backoff demonstrated; Postmark webhook signature verifies | Backlog |
| 5 | Marketing site | Astro with hardened CSP, privacy-respecting analytics (Plausible default), `security.txt`, cookie consent banner. | Lighthouse 95+ on perf and security headers; CSP report-only mode wired | Backlog |
| 6 | Infra | Terraform Azure module set (primary) + AWS module set (parallel swap), both `terraform plan`-clean for `dev` environment. | `terraform plan -var-file=dev.tfvars` succeeds for both Azure and AWS with no errors | Backlog |
| 7 | Docs | `docs/architecture.md`, `docs/security.md` (STRIDE threat model), full ADR set in `docs/adrs/`, all runbooks (incident, DR, restore, key rotation, secret rotation, DSAR export/delete, multi-tenant upgrade, email domain setup), `docs/compliance/`, `docs/legal/`, `AGENTS.md` final pass, `PROJECT_STATUS.md` final pass. | All runbooks linked from `docs/index.md`; no broken links | Backlog |
| 8 | Acceptance | End-to-end verification against the full acceptance-criteria list in `/ai/reference/NEW_TEMPLATE_PROMPT.md`; gap fixing. | Every box in "Acceptance criteria" checked | Backlog |

---

## Acceptance Criteria (Phase 8 target)

From `/ai/reference/NEW_TEMPLATE_PROMPT.md`:

1. `pnpm setup && pnpm dev` boots the full stack on a clean machine in under 5 minutes.
2. A user can sign up via Clerk, land in the app, see their profile, and sign out.
3. A user can register a passkey via Clerk and use it to step up for a "delete account" action.
4. All CI gates pass on the initial commit (lint, typecheck, tests, dep audit, gitleaks, semgrep, codeql, SBOM).
5. `terraform plan -var-file=dev.tfvars` succeeds for both Azure and AWS modules.
6. Marketing site, web app, and API are reachable on three distinct subdomains in dev.
7. Runbooks exist for: incident response, DR/restore, key rotation, secret rotation, DSAR export/delete, multi-tenant upgrade, email domain setup.
8. `AGENTS.md` documents layer rules clearly enough that a follow-up AI pass can wire in product features without violating them.
9. `PROJECT_STATUS.md` lists every stubbed item with a TODO and a doc link.
10. `docs/security.md` STRIDE threat model exists, mapping each control to a STRIDE category.
11. Phase plan was followed: each phase landed in its own commit/PR with verification evidence.
