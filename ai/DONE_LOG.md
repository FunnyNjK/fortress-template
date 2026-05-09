# Done Log

Last Updated: 2026-05-09

## 2026-05-09

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
- CHAT_END (2026-05-09): Ran `/ai/templates/CHAT_END_PROMPT.md`; refreshed `CURRENT_STATE`
  tip-of-`main` pointer; `ARCHITECTURE` / `ROADMAP` / `TESTING` / `DEPLOYMENT` / `DECISIONS`
  unchanged (not touched this pass). (`TBD`)

## 2026-05-02
- Created customized AI project starter for WSL-native dev with Astro 5 +
  React 19 + Tailwind 4 + Azure SWA stack.
- Added `/ai/START_HERE.md` as the single AI entry point.
- Added cross-project rules in `/ai/AI_RULES.md` and `/ai/DEV_ENVIRONMENT.md`.
- Pre-populated cross-project ADRs ADR-001 through ADR-010.
- Added project planning, architecture, task, testing, deployment, decision,
  and handoff files.
