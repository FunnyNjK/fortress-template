import { defineConfig } from 'vitest/config';

/** Phase 2 integration suite (docker Postgres/Redis in CI); runs serially. */
export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['test/setup-env.ts'],
    include: ['test/integration/**/*.test.ts'],
    testTimeout: 180_000,
    fileParallelism: false,
    maxConcurrency: 1,
    sequence: {
      shuffle: false,
      concurrent: false,
    },
  },
});
