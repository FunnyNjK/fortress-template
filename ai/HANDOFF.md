# AI Handoff

Last Updated: 2026-05-10

> **Target shape: ≤ 50 lines.** Baton, not a diary.

## Current State Summary

**Phase 1 complete** (`P1-T1`–`P1-T6`): `packages/types`, `crypto`, `auth-core`, `observability`,
`sdk`, `testing` — each with README, build/lint/typecheck/test scripts, Vitest smoke tests.
Root `devDependencies` includes `@types/node` (for `typescript` `types: ["node"]` in packages).

**Post-Phase-1 cleanup commit (2026-05-10)**: restored the migration ADR as ADR-026 (the original
ADR-023 was lost in a CHAT_END reconciliation; ADR-023 now correctly belongs to the unrelated
"typescript at workspace root" decision); added ADR-027 documenting that config-typescript and
config-eslint were scaffolded in Phase 0 not Phase 1; removed `scripts/setup.ps1` (Cursor produced
it during P0-T6 against ADR-026); reconciled `PHASE_MANIFEST.md` and `phase-manifest.json` to mark
P0 and P1 Complete; hardened `docker-compose.yml` env handling (no fallback secrets); upgraded
`/ai/templates/CHAT_END_PROMPT.md` with explicit pull-rebase / edit-deltas hard rules to prevent
future content loss; added `/CLAUDE.md` stub.

## Last Completed Task

Post-Phase-1 cleanup (2026-05-10) — see `DONE_LOG.md` for the full delta.
Phase 1 itself: shared library packages (`df43b73`).

## Active Task

None — start **Phase 2** (API skeleton): decompose in `/ai/TASKS.md`, then scaffold `apps/api`.

## Next Recommended Task

Add P2 atomic tasks to `/ai/TASKS.md`; implement NestJS 11 API per `/ai/ROADMAP.md`.

## What Is Blocked

None.

## Important Instructions for Next AI

- Confirm **CI green on `origin/main`** after each push (verify on GitHub).
- Phase 2 stays **Unattended: Yes** until real Clerk/Postgres wiring; follow task matrix in `/ai/TASKS.md`.
- No business logic in shared packages; honor `AGENTS.md`.
- **Read the new hard rules in `/ai/templates/CHAT_END_PROMPT.md` before any planning-file edits.**
  They exist because past CHAT_END passes silently lost ADR content (see ADR-001 number-history
  note and ADR-026). Pull-rebase first; edit deltas, not full files.
- When kicking off Phase 2, pass `<N>` exactly equal to the Phase 2 task count — never larger.
  Per ADR-022, every phase boundary requires explicit human approval before the next phase runs.

## Known Risks

- `packages/sdk` sets `engines.node` for `eslint-plugin-n`; keep aligned with `.node-version`.

## Tests / Checks Last Run

- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm audit --audit-level=high` (clean); YAML `ci.yml` /
  `dependabot.yml` parse; `bash -n scripts/setup.sh`; `grep -c replace-with-` `.env.example` (=27). Local branch
  matched `origin/main` when checks ran.
