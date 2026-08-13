import { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'
import campfirePlugin from './eslint-plugin.js'

const lintConfig = (rules: Linter.RulesRecord): Linter.Config => ({
  plugins: { campfire: campfirePlugin },
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
  rules,
})

describe('campfire eslint plugin', () => {
  it('exposes the campfire namespace via meta.name', () => {
    expect(campfirePlugin.meta?.name).toBe('campfire')
  })

  it('exports the no-color-prop and no-theme-colors rules', () => {
    expect(Object.keys(campfirePlugin.rules ?? {}).sort()).toEqual([
      'no-color-prop',
      'no-theme-colors',
    ])
  })

  it('each rule is a runnable rule object', () => {
    for (const rule of Object.values(campfirePlugin.rules ?? {})) {
      expect(rule).toBeTypeOf('object')
      expect(typeof (rule as { create?: unknown }).create).toBe('function')
    }
  })

  describe('loaded into ESLint as a plugin', () => {
    const linter = new Linter()

    it('reports no-theme-colors through the plugin namespace', () => {
      const messages = linter.verify(
        'const c = theme.colors.liquorice',
        lintConfig({ 'campfire/no-theme-colors': 'error' }),
      )

      expect(messages).toHaveLength(1)
      expect(messages[0]).toMatchObject({
        ruleId: 'campfire/no-theme-colors',
        messageId: 'noThemeColors',
        severity: 2,
      })
    })

    it('applies the no-color-prop autofix through the plugin namespace', () => {
      const { output, fixed } = linter.verifyAndFix(
        '<Loader color="lollipop" />',
        lintConfig({ 'campfire/no-color-prop': 'error' }),
      )

      expect(fixed).toBe(true)
      expect(output).toBe('<Loader color="color.surface.brand.400" />')
    })

    it('honours rule options passed through ESLint config', () => {
      const code = '<Loader name="cream" />'

      expect(
        linter.verify(code, lintConfig({ 'campfire/no-color-prop': 'error' })),
      ).toHaveLength(0)

      expect(
        linter.verify(
          code,
          lintConfig({
            'campfire/no-color-prop': ['error', { strictMode: true }],
          }),
        ),
      ).toHaveLength(1)
    })
  })
})
