import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

import { noColorPropRule } from './eslint-rules/no-color-prop/no-color-prop.js'
import { noThemeColorsRule } from './eslint-rules/no-theme-colors/no-theme-colors.js'

const campfireEslintPlugin = {
  rules: {
    'no-color-prop': noColorPropRule,
    'no-theme-colors': noThemeColorsRule,
  },
}

const config = [
  eslintPluginPrettierRecommended,
  {
    ignores: ['node_modules', 'dist', 'build'],
  },
  {
    files: ['**/*.+(ts|tsx)'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      campfire: campfireEslintPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn', // Warns on use of 'any'
      '@typescript-eslint/explicit-function-return-type': 'off', // Disables return type enforcement
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      'no-console': 'warn', // Warns on console.log and similar calls
      strict: ['error', 'never'],
      // Custom campfire rules
      'campfire/no-color-prop': 'warn',
      'campfire/no-theme-colors': 'warn',
    },
  },
]
export default config
