import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 2024,
      sourceType: 'module',
    },
    plugins: {
      prettier: prettierPlugin,
      'unused-imports': unusedImports,
    },
    extends: [js.configs.recommended, prettier],
    rules: {
      'prettier/prettier': 'warn',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],
    },
  },
]);

