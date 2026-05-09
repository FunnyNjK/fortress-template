# Phase Manifest

Last Updated: 2026-05-09

Estimated total tasks across all 9 phases: ~51 (14 complete: 8 in P0 + 6 in P1; 6 in P2 decomposed; ~31 estimated for P3–P8).

| Phase | Title               | Tasks  | Run command          | Verification                                                                                       | Status   |
|-------|---------------------|--------|----------------------|----------------------------------------------------------------------------------------------------|----------|
| P0    | Repo skeleton       | 8      | `./run-phase.sh 8`   | `pnpm install && pnpm typecheck && pnpm lint` pass; CI green on initial commit                     | Complete |
| P1    | Shared packages     | 6      | `./run-phase.sh 6`   | Each package has smoke tests; all build, lint, and link correctly                                  | Complete |
| P2    | API skeleton        | ~6     | `./run-phase.sh <N>` | API boots; security middleware integration test passes; rate-limit smoke test passes               | Ready    |
| P3    | Web skeleton        | ~5     | `./run-phase.sh <N>` | E2E: sign up via Clerk → land in app → see "hello, [name]" → sign out                              | Backlog  |
| P4    | Worker skeleton     | ~4     | `./run-phase.sh <N>` | Worker consumes test job; retry/backoff demonstrated; Postmark webhook signature verifies          | Backlog  |
| P5    | Marketing site      | ~4     | `./run-phase.sh <N>` | Lighthouse 95+ on perf and security headers; CSP report-only mode wired                            | Backlog  |
| P6    | Infrastructure      | ~6     | `./run-phase.sh <N>` | `terraform plan -var-file=dev.tfvars` succeeds for both Azure and AWS modules                      | Backlog  |
| P7    | Documentation       | ~8     | `./run-phase.sh <N>` | All runbooks linked from `docs/index.md`; no broken links                                          | Backlog  |
| P8    | Acceptance          | ~4     | `./run-phase.sh <N>` | Every box in `NEW_TEMPLATE_PROMPT.md` acceptance criteria checked                                  | Backlog  |

## Notes

- **Task count**: Phase 0 is exact (8 tasks). Phases 1–8 counts are estimates; the
  decomposition session for each phase will set the final count and update this table
  and `/phase-manifest.json`.
- **Run command**: Replace `<N>` with the final task count for that phase once decomposed.
  The harness uses the task count to know when a phase is complete.
- **Unattended profile**: P0, P1, P2, P5, P7 are fully unattended. P3, P4, P6, P8 are
  Partial — see the Human pairing matrix in `/ai/TASKS.md` for details.
- **Estimated total tasks across all 9 phases**: ~51 (14 complete: 8 in P0 + 6 in P1; ~37 estimated for P2–P8).
- **Cursor CLI variant**: `./run-phase-cursor.sh <N>` runs the same phase via the
  Cursor CLI harness.
- **Phase boundary discipline.** The harness scripts run `<N>` consecutive
  tasks then exit. The boundary between phases is enforced by the human
  passing the right `<N>` — not by the script. Per ADR-022, every phase
  must be reviewed before the next one starts. If the harness picks up the
  next phase's first task because there's a Ready task in TASKS.md and you
  passed too large an `<N>`, that's a process violation. The fix is in your
  hands: pass exactly the remaining task count for the active phase, then
  review before kicking off the next phase.
