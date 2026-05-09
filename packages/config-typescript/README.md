# @fortress/config-typescript

Shared `tsconfig` bases for the Fortress monorepo: extend `base.json` or a preset (`next.json`, `node.json`, `library.json`) from your app or package `tsconfig.json` (for example `"extends": "@fortress/config-typescript/base.json"`). A tiny committed `fortress-config-stub.d.ts` exists only so `tsc --noEmit` has an input in this otherwise JSON-only package; do not import it from product code.
