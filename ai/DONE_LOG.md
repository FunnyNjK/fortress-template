# Done Log

Last Updated: 2026-05-09

## 2026-05-10

- **Post-Phase-1 cleanup commit** — addresses findings from the Phase 0+1 review:
  - **Restored the migration ADR as ADR-026.** Original was written as ADR-023 on
    2026-05-09 but was lost during a CHAT_END reconciliation that reverted the
    ADR-001 supersession marker and overwrote the ADR body. ADR-023 was subsequently
    reused for an unrelated "typescript at workspace root" decision (now retained
    in place). ADR-001 is again marked Superseded by ADR-026 with a number-history
    note.
  - **Added ADR-027** documenting that `config-typescript` and `config-eslint` are
    scaffolded in Phase 0 (P0-T2 / P0-T3), not Phase 1 as the original spec listed
    them. Phase 1 task count is therefore 6, not 8; total across P0+P1 is 14.
  - **Removed `scripts/setup.ps1`.** Cursor produced it during P0-T6 against the
    explicit "Scope Excluded" line and against ADR-026 (Ubuntu-only target). The
    historical P0-T6 DONE_LOG entry is preserved (it accurately records what the
    harness produced); this entry records the corrective deletion.
  - **Reconciled `/PHASE_MANIFEST.md` and `/phase-manifest.json`.** Both now mark
    P0 and P1 as `Complete`; P1 has `task_count: 6` and `task_ids: ["P1-T1"…"P1-T6"]`.
    Added a phase-boundary discipline note to PHASE_MANIFEST.md.
  - **Updated all references from "ADR-023" → "ADR-026"** where they meant the
    Ubuntu migration: `AI_RULES.md`, `DEV_ENVIRONMENT.md`, `KICKOFF_PROMPT.md`,
    `COWORK_PICKUP_PROMPT.md`, `NEW_TEMPLATE_PROMPT.md`, `INIT_PROMPT.md`,
    `REFRESH_PROMPT.md`, `REVIEW_PHASE_PROMPT.md`, `TASKS.md`. Legitimate
    references to the new ADR-023 (typescript) are unchanged.
  - **Hardened `docker-compose.yml`.** Removed inline fallback values for
    `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `REDIS_PASSWORD` and
    Unleash's `DATABASE_URL`. Compose now fails loudly if `.env` is not loaded
    (per the AGENTS.md "secrets never live in code or in the repository" rule).
  - **Upgraded `/ai/templates/CHAT_END_PROMPT.md`** with a "Hard rules" section:
    pull-rebase first, edit deltas not files, read before edit, verify after.
    These exist specifically to prevent future planning-content loss like the
    ADR-026 incident and the `d0224ab` DONE_LOG-entry restoration earlier.
  - **Added `/CLAUDE.md` stub** at the repo root (spec listed it; it didn't
    exist) pointing at `/AGENTS.md` and `/ai/START_HERE.md`.
  - Per-task entries in TASKS.md updated: P0-T6 one-liner now references
    `setup.sh` only with a note about the cleanup deletion.
  - Updated `/ai/CURRENT_STATE.md` and `/ai/HANDOFF.md` to reflect the cleanup
    pass and point the next session at Phase 2 decomposition.
  - Open YELLOW findings deferred (not blocking Phase 2): caret/tilde version
    ranges across `package.json` files (Dependabot manages bumps; lockfile is the
    actual pinned source of truth). Will be addressed in a follow-up if/when
    reproducibility issues surface.

## 2026-05-09

- **P2-T3** — Drizzle **`audit_events`** + **`sessions`** (`apps/api/src/db/schema/`), re-exported from **`schema/index.ts`**; forward migration **`drizzle/0001_rainy_hairball.sql`** + **`meta/0001_snapshot.json`** (append-only trigger **`fortress_audit_events_append_only`** on **`audit_events`**, function + **`EXECUTE FUNCTION`**); indexes: **`audit_events (user_id, created_at desc)`**, **`sessions (user_id)`**, partial **`sessions (user_id) WHERE stepped_up_at IS NOT NULL`**, unique **`hashed_session_token`**. Integration tests: **`test/db/audit-events-append-only.integration.test.ts`**, **`test/db/sessions-schema.integration.test.ts`**. (`28730ce`)

- CHAT_END (2026-05-09): Ran `/ai/templates/CHAT_END_PROMPT.md`; `git fetch` clean vs `origin/main` at `e9f57a0`; YAML `ci.yml` + `dependabot.yml` (**python3** `yaml.safe_load`); `npx pnpm@10.33.4 lint` + `typecheck` + `test` + `build`; `pnpm audit --audit-level=high` (**1 moderate**, below gate); `bash -n scripts/setup.sh`; `grep -c replace-with-` `.env.example` (=27); ARCHITECTURE / ROADMAP / TESTING / DEPLOYMENT / DECISIONS unchanged this pass.

- **P2-T2** — Drizzle **`0.45.2`** + **`pg` `8.20.0`** + **`drizzle-kit` `0.31.10`** (**exact pins**): global **`DbModule`** (`PG_POOL`, **`DRIZZLE`** token, **`PgPoolLifecycle`** **`onModuleDestroy`**), **`src/db/schema/users`**, **`drizzle.config.ts`**, first migration **`drizzle/0000_sad_major_mapleleaf.sql`** + **`meta/`**, **`DATABASE_URL`** in Zod env schema, scripts **`db:generate`** / **`db:migrate`** / **`db:studio`**, **`test/setup-env.ts`**, **`test/db/users.integration.test.ts`** (skip w/ reason if unreachable); CI **`test`** job **Postgres 18-alpine** service + **`DATABASE_URL`**. (`70dab75`)

- **P2-T1** — Scaffold `apps/api` (NestJS **11.x** pinned): Nest CLI `nest build` / `nest start --watch`, `EnvConfigModule` + Zod **`validateEnv`** (PORT coerced); **`assertNoPlaceholderSecretsInProduction`** scans `process.env` when `NODE_ENV=production`; `nestjs-pino` + `NestFactory.create(..., bufferLogs:true)` / `enableShutdownHooks()`; `.env` resolution `apps/api/.env` then repo-root `../../.env`. Vitest: supertest **`GET /` → 404**, env schema coverage. **`@fortress/observability`**: export **`fortressPinoRedactPaths()`** (includes **`*.secret`**, **`*.apiKey`**) shared with `createFortressLogger`. (`7b4cdb8`)

- CHAT_END (2026-05-09): Ran `/ai/templates/CHAT_END_PROMPT.md`; `git fetch` clean vs `origin/main` at `1bedc16`; YAML parse `ci.yml` + `dependabot.yml`; `npx pnpm@10.33.4 lint` + `typecheck` + `test` + `build`; `audit --audit-level=high` (clean); `bash -n scripts/setup.sh`; `grep -c replace-with-` `.env.example` (=27); ARCHITECTURE / ROADMAP / TESTING / DEPLOYMENT / DECISIONS unchanged this pass.

- CHAT_END (2026-05-09): Ran `/ai/templates/CHAT_END_PROMPT.md`; reconciled `CURRENT_STATE`, `TASKS`, `HANDOFF`,
  `DONE_LOG` vs `origin/main` (clean); YAML parse `ci.yml` + `dependabot.yml`; `pnpm lint` +
  `pnpm typecheck` + `pnpm test` + `pnpm audit --audit-level=high` (clean); `bash -n scripts/setup.sh`;
  `grep -c replace-with-` `.env.example` (=27); ARCHITECTURE / ROADMAP / TESTING / DEPLOYMENT / DECISIONS
  unchanged this pass.
- Phase 1 (`P1-T1`–`P1-T6`): Shared packages — `packages/types` (branded IDs, constants), `crypto`
  (AES-256-GCM, HMAC-SHA256, timing-safe compare), `auth-core` (CSRF/helpers, `__Host-fs_session` name),
  `observability` (Pino logger + redaction defaults), `sdk` (Zod `AuthMeResponse`, `createFortressSdk`),
  `testing` (fixtures); per-package `eslint.config.js`, `vitest.config.ts`, dual `tsconfig` (emit +
  full check); root `@types/node`; `packages/sdk` `engines.node`. Verification: `pnpm build` / `lint` /
  `typecheck` / `test` / `audit --audit-level=high`. (`df43b73`)
- CHAT_END (2026-05-09 — prior): Ran `/ai/templates/CHAT_END_PROMPT.md`; reconciled vs `origin/main` at `8f072fc`
  (clean); Phase 0 complete / no active task; YAML parse `ci.yml` + `dependabot.yml`; `pnpm lint` +
  `pnpm typecheck` + `pnpm audit --audit-level=high` (clean); `bash -n scripts/setup.sh`;
  `grep -c replace-with-` `.env.example` (=27); ARCHITECTURE / ROADMAP / TESTING / DEPLOYMENT /
  DECISIONS unchanged. (`5391624`)
- P0-T8: Add `.well-known/security.txt` (RFC 9116 fields, fork placeholders), root `AGENTS.md`
  (layer rules, 10 locked decisions, 10 security invariants, secrets-out-of-repo emphasis,
  fork follow-up guidance), `PROJECT_STATUS.md` (phases 0–8 table, decision status, `REFRESH_PROMPT`
  flag); `/ai/TASKS.md` / `HANDOFF` / `CURRENT_STATE` / `ROADMAP` Phase 0 closed. (`195dd87`)
- P0-T7: CI workflow scaffolding — `.github/workflows/ci.yml`: jobs `install` (pnpm store cache via
  `setup-node`), `lint` / `typecheck` / `test` / `dep-audit` / `sbom` (`needs: install`), `gitleaks`
  / `semgrep` / `codeql` parallel to install path; `returntocorp/semgrep-action@v1`,
  `gitleaks/gitleaks-action@v2.3.9`, `github/codeql-action@v3.35.4` (`javascript-typescript`),
  CycloneDX via `npx @cyclonedx/cyclonedx-npm@4.2.1 --ignore-npm-errors` + `upload-artifact`;
  all `uses:` refs commit-SHA pinned; job-level `permissions`. `.github/dependabot.yml` weekly
  `npm` + `github-actions`. Root `.gitleaks.toml` with `[extend] useDefault = true` and `.env.example`
  allowlist. (`127971c`)
- P0-T6: Add `scripts/setup.sh` and `scripts/setup.ps1` — idempotent `.env` from `.env.example`:
  `openssl rand -hex 32` (except `ENCRYPTION_KEY` base64); refuses `NODE_ENV=production`;
  existing `.env` requires `--force` / `-Force`; docker compose up after write; appends
  `POSTGRES_PASSWORD` / `REDIS_PASSWORD` matching `DATABASE_URL` / `REDIS_URL` for Compose;
  does not print secret values; `setup.ps1` requires PowerShell 7+. (`53f1a4e`)
- P0-T5: Add `.env.example` — canonical env template: warning header; sections per
  TASKS (App URLs, Clerk, Postmark, Stripe, Sentry, OTLP, Database, Redis, Unleash,
  Encryption, CSP, misc/Azure); all vars from `/ai/DEPLOYMENT.md` "Required Environment
  Variables"; `replace-with-*` placeholders for secrets/keys; local URLs on `127.0.0.1`
  with ports matching `docker-compose.yml` (3000/4000 app placeholders, 5432, 6379,
  4242, 4318 OTLP HTTP); `dotenv` parse check OK.
- P0-T4: Add docker-compose.yml for local dev supporting services — root
  `docker-compose.yml` with five services (Postgres 18, Redis 8, Mailpit, Azurite,
  Unleash); images pinned with digest; `127.0.0.1` port bindings; named volumes;
  health checks; `POSTGRES_*` / `REDIS_PASSWORD` env wiring; Unleash uses DB `unleash`
  on shared Postgres via `docker/postgres/docker-entrypoint-initdb.d/01-create-unleash-database.sql`;
  Postgres 18+ data volume mount at `/var/lib/postgresql`. (`7abb535`)
- P0-T3: Add shared ESLint config package — `packages/config-eslint`
  (`@fortress/config-eslint`): `base.js` (`typescript-eslint` strict type-checked,
  `no-floating-promises`, `consistent-type-imports`, `no-unsafe-*`, `no-eval` /
  `no-implied-eval`, `no-console` warn), `next.js` (FlatCompat + `next/core-web-vitals`),
  `node.js` (`eslint-plugin-n` flat recommended + Node globals), `eslint.config.js`
  self-lint (`disableTypeChecked` for `.js`), `README.md`, **ADR-024** for dependency stack.
  (`240606f`)
- P0-T2: Add shared TypeScript config package — `packages/config-typescript`
  (`@fortress/config-typescript`): `base.json`, `next.json`, `node.json`, `library.json`,
  `README.md`, `exports` map, `tsconfig.json` + `tsconfig.package-path.json` validating
  workspace `extends`; root `devDependencies` + **ADR-023** for workspace `typescript`.
  Minimal `fortress-config-stub.d.ts` for `tsc --noEmit` with no app source in package.
  (`67200e7`)
- P0-T1: Initialize the monorepo skeleton — added `pnpm-workspace.yaml`, `turbo.json`,
  root `package.json` (`packageManager` pnpm@10.33.4, turbo 2.9.12), `.node-version`
  24.15.0, `.editorconfig`, `.prettierrc`; `pnpm-lock.yaml` from install. (`a58986b`)
- Post-P0-T1 planning: DONE_LOG hash footnote (`9bce76f`); HANDOFF/CURRENT_STATE push sync (`0dc397f`).
- CHAT_END (2026-05-09): Ran `/ai/templates/CHAT_END_PROMPT.md`; fixed `CURRENT_STATE` next-action
  (P0-T3 already on `origin/main`); `ARCHITECTURE` / `ROADMAP` / `TESTING` / `DEPLOYMENT` / `DECISIONS`
  unchanged (not touched this pass). (`c01b3e2`)

## 2026-05-02
- Created customized AI project starter for WSL-native dev with Astro 5 +
  React 19 + Tailwind 4 + Azure SWA stack.
- Added `/ai/START_HERE.md` as the single AI entry point.
- Added cross-project rules in `/ai/AI_RULES.md` and `/ai/DEV_ENVIRONMENT.md`.
- Pre-populated cross-project ADRs ADR-001 through ADR-010.
- Added project planning, architecture, task, testing, deployment, decision,
  and handoff files.
