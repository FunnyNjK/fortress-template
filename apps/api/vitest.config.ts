import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    exclude: [...configDefaults.exclude, 'test/integration/**/*.test.ts'],
    setupFiles: ['test/setup-env.ts'],
    testTimeout: 30_000,
    /** DB-backed files under test/db share one CI Postgres — parallel migrate() races (pg_type_typname_nsp_index). */
    fileParallelism: false,
    maxConcurrency: 1,
    sequence: { concurrent: false },
  },
});
