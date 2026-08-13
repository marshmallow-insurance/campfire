import { defineConfig, type OxlintConfig } from 'oxlint'

/**
 * Shared oxlint base config — framework agnostic, so it suits any TypeScript
 * project. React projects should extend `oxlint.react.config` instead, which
 * layers the React plugins and campfire's component rules on top of this.
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
  // `vitest` rules have no filename scoping, but they only fire in files that
  // import vitest APIs, so enabling the plugin globally covers test helpers and
  // mock factories that a test-file glob would miss
  plugins: ['typescript', 'promise', 'vitest'],
  categories: {
    correctness: 'error',
  },
  rules: {
    'typescript/ban-ts-comment': 'warn',
    // Type-aware rules, so they only run when the app sets `options.typeAware`
    // and installs `oxlint-tsgolint`
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
        ignoreMixedLogicalExpressions: true,
        ignorePrimitives: {
          boolean: true,
        },
      },
    ],
    'vitest/expect-expect': 'warn', // Downgraded from correctness
    'vitest/no-disabled-tests': 'warn', // Downgraded from correctness
    'no-console': [
      'error',
      {
        allow: ['warn', 'error'],
      },
    ],
  },
  overrides: [
    {
      // Correctness rules the TypeScript compiler already reports, so oxlint
      // does not repeat them. Rules from categories this config leaves off are
      // not listed — they only need disabling if an app enables that category.
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
