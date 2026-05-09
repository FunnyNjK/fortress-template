import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import tseslint from 'typescript-eslint';

import fortressNode from '@fortress/config-eslint/node';

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  { ignores: ['**/node_modules/**', 'dist/**'] },
  ...fortressNode,
  {
    files: ['**/*.module.ts'],
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
  {
    files: ['**/*.{ts,mts}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}', '**/vitest.config.ts'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
