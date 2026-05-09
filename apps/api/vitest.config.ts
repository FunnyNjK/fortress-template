import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    exclude: [...configDefaults.exclude, 'test/integration/**/*.test.ts'],
    setupFiles: ['test/setup-env.ts'],
    testTimeout: 30_000,
  },
});
