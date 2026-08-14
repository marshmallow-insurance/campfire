import { defineConfig, type OxlintConfig } from 'oxlint'

/**
 * Rules, plugins and overrides — the fields oxlint inherits through `extends`.
 * Exported so variants like `oxlint.react.config` can build on it; apps should
 * spread this module's default export instead.
 */
export const extendableConfig = defineConfig({
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
 * The fields oxlint does *not* inherit through `extends` — it keeps only the
 * extending config's `env`, `globals`, `settings` and `ignorePatterns` (see
 * `Oxlintrc::merge` in oxc). They ride along in the default export so apps get
 * them from the same spread.
 */
export const nonInheritedFields = {
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

/**
 * Shared oxlint config — framework agnostic, so it suits any TypeScript
 * project. React apps should use `oxlint.react.config` instead, which layers the
 * React plugins and campfire's component rules on top of this one.
 *
 * Spread it into your app's `oxlint.config.ts`:
 *
 * ```ts
 * import campfireConfig from '@mrshmllw/campfire/configs/oxlint.config'
 * import { defineConfig } from 'oxlint'
 *
 * export default defineConfig({
 *   ...campfireConfig,
 *   // app specific config goes here, after the spread
 * })
 * ```
 */
export default {
  extends: [extendableConfig],
  ...nonInheritedFields,
} satisfies OxlintConfig
