import { noColorPropRule } from './eslint-rules/no-color-prop/no-color-prop.js'
import { noThemeColorsRule } from './eslint-rules/no-theme-colors/no-theme-colors.js'

/** @type {import('eslint').ESLint.Plugin} */
const campfirePlugin = {
  meta: { name: 'campfire' },
  rules: {
    'no-color-prop': noColorPropRule,
    'no-theme-colors': noThemeColorsRule,
  },
}

export default campfirePlugin
