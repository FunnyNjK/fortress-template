import eslintN from 'eslint-plugin-n';
import globals from 'globals';

import base from './base.js';

export default [
  ...base,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    plugins: {
      n: eslintN,
    },
    languageOptions: {
      globals: {
        ...globals.nodeBuiltin,
        ...globals.node,
      },
    },
    rules: {
      ...eslintN.configs['flat/recommended'].rules,
    },
  },
];
