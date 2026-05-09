# @fortress/config-eslint

Shared **ESLint 9 flat configs** for Fortress apps and packages: strict
type-aware `@typescript-eslint` defaults, `no-floating-promises`, enforced
`consistent-type-imports`, and unsafe-any rules. Presets extend this base for
Node (`./node`) and Next.js (`./next`). Add an `eslint.config.js` that spreads
the preset you need and set `languageOptions.parserOptions.tsconfigRootDir` to
`import.meta.dirname` at the repo package root when ESLint cannot find your
`tsconfig.json`.
