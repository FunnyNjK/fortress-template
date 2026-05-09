# AI Handoff

Last Updated: 2026-05-09

> **Target shape: ≤ 50 lines.** Baton, not a diary.

## Current State Summary

**Phase 2 complete** (**`P2-T6`**): **`HealthModule`** (**`GET /healthz`** liveness **`{ status, uptime, version }`** with **`FORTRESS_API_VERSION`**; **`GET /readyz`** Postgres + Redis checks, 503 **`{ status:'unavailable', checks }`**); **`@SkipRateLimit()`** on health routes (**`SKIP_RATE_LIMIT_KEY`** in **`rate-limit.guard`**). Integration tests live under **`apps/api/test/integration/`**; **`pnpm --filter api test`** excludes them; **`test:integration`** + CI **`api-integration`** (**compose `.env`** + **`postgres`/`redis` --wait**, migrate). **`apps/api/README.md`** added.

## Last Completed Task

**`P2-T6`** — **`DONE_LOG`**; feature commit **`f65aca4`**; branch tip **`origin/main`** **`72b07fb`** (includes docs-only follow-ups).

## Active Task

None — **phase boundary**. **Human must approve Phase 3** before picking up **`apps/web`** (**`TASKS.md`/`ROADMAP`**, **`Unattended: Partial`**).

## Next Recommended Task

After human approval: scaffold **`apps/web`** (Phase 3) — first **`TASKS`** line in Backlog section.

## What Is Blocked

Human phase gate (**ADR-022**): do **not** start P3 unattended until approved.

## Important Instructions for Next AI

- Confirm **CI green** on **`origin/main`** (**`api-integration`** depends on **`REDIS_URL`** with **`REDIS_PASSWORD`** from compose, e.g. **`redis://:test@127.0.0.1:6379/0`** in CI env).
- **`pnpm`** locally: **`npx pnpm@10.33.4`** when **`pnpm`** not on **`PATH`**.

## Known Risks

- Redis failure tests patch **`Redis#ping`** / **`vi.spyOn(db,'execute')`** — restore in **`finally`**.

## Tests / Checks Last Run

- CHAT_END (2026-05-09): **`npx pnpm@10.33.4`** **`lint`** **`typecheck`** **`test`** **`build`**; **`pnpm audit --audit-level=high`** (**1 moderate**). **`python3`** **`yaml.safe_load`** **`ci.yml`** + **`dependabot.yml`**; **`bash -n`** **`scripts/setup.sh`**. **`test:integration`**: CI **`api-integration`** or local Compose + **`REDIS_URL`** with **`requirepass`**.
