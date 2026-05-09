import tseslint from 'typescript-eslint';

/**
 * Type-checked ESLint preset for all workspace TS/TSX.
 * Consumers should add `tsconfigRootDir: import.meta.dirname` under
 * `languageOptions.parserOptions` in their root `eslint.config.js` if
 * `projectService` fails to resolve the right tsconfig.
 */
export default tseslint.config(
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
  },
  ...tseslint.configs.strictTypeChecked,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-unary-minus': 'error',
      'no-console': 'warn',
      'no-eval': 'error',
      'no-implied-eval': 'error',
    },
  },
);
