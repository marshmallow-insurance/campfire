import { defineConfig, type OxlintConfig } from 'oxlint'
import baseConfig, {
  nonInheritedConfig as baseNonInherited,
} from './oxlint.config.js'

/**
 * Shared oxlint config for Marshmallow React apps: everything in
 * `oxlint.config` plus the React plugins and campfire's component rules.
 *
 * Extend it from your app's `oxlint.config.ts`:
 *
 * ```ts
 * import campfireConfig, { nonInheritedConfig } from '@mrshmllw/campfire/configs/oxlint.react.config'
 * import { defineConfig } from 'oxlint'
 *
 * export default defineConfig({
 *   extends: [campfireConfig],
 *   ...nonInheritedConfig,
 * })
 * ```
 */
const config = defineConfig({
  extends: [baseConfig],
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

/**
 * The base config's non-inherited fields plus React's `settings`. See
 * `nonInheritedConfig` in `oxlint.config` for why these travel separately.
 */
export const nonInheritedConfig = {
  ...baseNonInherited,
  settings: {
    ...baseNonInherited.settings,
    react: {
      version: '19',
    },
  },
} satisfies Pick<OxlintConfig, 'env' | 'settings' | 'ignorePatterns'>

export default config
