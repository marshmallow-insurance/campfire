import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

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
    },
  },
]
export default config
