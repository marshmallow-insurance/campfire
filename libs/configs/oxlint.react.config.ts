import { defineConfig, type OxlintConfig } from 'oxlint'
import {
  extendableConfig as baseExtendableConfig,
  nonInheritedFields as baseNonInheritedFields,
} from './oxlint.config.js'

/**
 * The base config's inheritable fields plus the React ones. `extends` chains, so
 * this stays a thin layer rather than a copy of the base.
 */
export const extendableConfig = defineConfig({
  extends: [baseExtendableConfig],
  plugins: ['react', 'react-perf', 'jsx-a11y'],
  jsPlugins: [
    {
      name: 'campfire',
      specifier: '@mrshmllw/campfire/configs/eslint-plugin',
    },
  ],
  rules: {
    'campfire/no-color-prop': 'warn',
    'campfire/no-theme-colors': 'warn',
    'react-hooks/exhaustive-deps': 'warn', // Downgraded from correctness, too noisy to block on
    // oxlint 1.79 split the nursery `react/react-compiler` rule into one rule per
    // React Compiler diagnostic category. Most of them landed in `correctness`,
    // so the base config's `categories` already turns them on. `react/hooks` is
    // the one Rules of React check that sits outside `correctness`, so it still
    // needs naming here. The remaining compiler rules stay off: they report
    // compiler limitations rather than bugs in the app.
    'react/hooks': 'error',
  },
})

/** The base config's non-inherited fields plus React's `settings`. */
export const nonInheritedFields = {
  ...baseNonInheritedFields,
  settings: {
    ...baseNonInheritedFields.settings,
    react: {
      version: '19',
    },
  },
} satisfies Pick<OxlintConfig, 'env' | 'settings' | 'ignorePatterns'>

/**
 * Shared oxlint config for Marshmallow React apps: everything in
 * `oxlint.config` plus the React plugins, campfire's component rules and the
 * React Compiler checks.
 *
 * Spread it into your app's `oxlint.config.ts`:
 *
 * ```ts
 * import campfireConfig from '@mrshmllw/campfire/configs/oxlint.react.config'
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
