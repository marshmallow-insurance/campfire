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
    'react/react-compiler': 'error', // Nursery rule, so it only runs when named explicitly
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
 * `oxlint.config` plus the React plugins, campfire's component rules and
 * `react/react-compiler`.
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
