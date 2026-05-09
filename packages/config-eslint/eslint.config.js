import js from '@eslint/js';
import tseslint from 'typescript-eslint';

import base from './base.js';

/** Self-lint: TS presets apply to .ts only; plain JS configs use disableTypeChecked. */
export default tseslint.config(
  { ignores: ['**/node_modules/**'] },
  js.configs.recommended,
  ...base,
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
