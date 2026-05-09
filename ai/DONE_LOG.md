# Done Log

Last Updated: 2026-05-09

## 2026-05-09

- P0-T8: Add `.well-known/security.txt` (RFC 9116 fields, fork placeholders), root `AGENTS.md`
  (layer rules, 10 locked decisions, 10 security invariants, secrets-out-of-repo emphasis,
  fork follow-up guidance), `PROJECT_STATUS.md` (phases 0–8 table, decision status, `REFRESH_PROMPT`
  flag); `/ai/TASKS.md` / `HANDOFF` / `CURRENT_STATE` / `ROADMAP` Phase 0 closed.
- CHAT_END: Ran `/ai/templates/CHAT_END_PROMPT.md`; reconciled `CURRENT_STATE`, `TASKS`, `HANDOFF`,
  `DONE_LOG` vs `origin/main` at start of pass; **P0-T8** still active; YAML parse `ci.yml` +
  `dependabot.yml`; `pnpm lint` + `pnpm typecheck` + `pnpm audit --audit-level=high` (clean); `bash -n scripts/setup.sh`; `grep -c replace-with-`
  `.env.example` (=27); `/ai/TESTING.md` Phase 0 CI summary; ARCHITECTURE / ROADMAP / DEPLOYMENT /
  DECISIONS unchanged.
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
