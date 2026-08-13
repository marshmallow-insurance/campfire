import { defineConfig, type OxlintConfig } from 'oxlint'

/**
 * Shared oxlint base config for Marshmallow frontends.
 *
 * Extend it from your app's `oxlint.config.ts`:
 *
 * ```ts
 * import campfireConfig, { nonInheritedConfig } from '@mrshmllw/campfire/configs/oxlint.config'
 * import { defineConfig } from 'oxlint'
 *
 * export default defineConfig({
 *   extends: [campfireConfig],
 *   ...nonInheritedConfig,
 * })
 * ```
 */
const config = defineConfig({
  plugins: ['typescript', 'jsx-a11y', 'promise', 'react', 'react-perf'],
  categories: {
    correctness: 'error',
  },
  jsPlugins: [
    {
      name: 'campfire',
      specifier: '@mrshmllw/campfire/configs/eslint-plugin',
    },
  ],
  rules: {
    'typescript/explicit-function-return-type': 'off',
    'campfire/no-color-prop': 'warn',
    'campfire/no-theme-colors': 'warn',
    'no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
      },
    ],
    // Type-aware rules only run when the app sets `options.typeAware` and installs `oxlint-tsgolint`
    'typescript/no-floating-promises': 'off', // TODO: Enable once downstream apps have fixed all existing issues
    'typescript/ban-ts-comment': 'warn',
    'typescript/no-misused-promises': [
      'error',
      {
        checksVoidReturn: {
          arguments: false,
          attributes: false,
          properties: false,
        },
      },
    ],
    'typescript/prefer-nullish-coalescing': [
      'warn',
      {
        ignoreConditionalTests: true,
        ignoreMixedLogicalExpressions: true,
        ignorePrimitives: {
          boolean: true,
        },
      },
    ],
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': [
      'error',
      {
        allow: ['warn', 'error'],
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        name: 'react',
        importNames: ['lazy'],
        message: "Please use 'lazyWithRetry' instead",
      },
      {
        name: 'yup',
        message: 'Please use `zod` instead of `yup` for your validation needs',
      },
      {
        name: 'react-error-boundary',
        message:
          'Please use `AppErrorBoundary` instead of `ErrorBoundary` to ensure proper configuration with our monitoring tools`',
        importNames: ['ErrorBoundary'],
      },
    ],
  },
  overrides: [
    {
      // Rules the TypeScript compiler already reports
      files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
      rules: {
        'constructor-super': 'off',
        'no-class-assign': 'off',
        'no-const-assign': 'off',
        'no-dupe-class-members': 'off',
        'no-dupe-keys': 'off',
        'no-func-assign': 'off',
        'no-import-assign': 'off',
        'no-new-native-nonconstructor': 'off',
        'no-obj-calls': 'off',
        'no-redeclare': 'off',
        'no-setter-return': 'off',
        'no-this-before-super': 'off',
        'no-unsafe-negation': 'off',
        'no-var': 'error',
        'no-with': 'off',
        'prefer-const': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
      },
    },
    {
      files: [
        '**/*.{test,spec}.{ts,tsx,js,jsx}',
        'src/test/**',
        '**/vitest.setup.{ts,tsx,js,jsx}',
        '**/setupTests.{ts,tsx,js,jsx}',
        '**/setupGlobals.{ts,tsx,js,jsx}',
      ],
      rules: {
        'no-unused-expressions': 'off', // Causes false positives when calling render()
        'vitest/expect-expect': 'warn',
        'vitest/no-disabled-tests': 'warn',
      },
      plugins: ['vitest'],
    },
  ],
})

/**
 * Fields oxlint does *not* inherit through `extends` — it keeps only the extending
 * config's `env`, `globals`, `settings` and `ignorePatterns` (see `Oxlintrc::merge`
 * in oxc). Spread this into your root config to pick up the shared values, and add
 * your own after the spread to override them.
 */
export const nonInheritedConfig = {
  env: {
    browser: true,
  },
  settings: {
    react: {
      version: '19',
    },
    jsdoc: {},
    vitest: {
      typecheck: false,
    },
  },
  ignorePatterns: [
    'dist/**',
    'node_modules/**',
    'build',
    '**/.*',
    'playwright-report',
    'README.md',
    '*.config.ts',
    '*.config.js',
    'vite-env.d.ts',
  ],
} satisfies Pick<OxlintConfig, 'env' | 'settings' | 'ignorePatterns'>

export default config
