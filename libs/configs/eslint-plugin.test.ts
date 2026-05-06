import { describe, expect, it } from 'vitest'
import campfirePlugin from './eslint-plugin.js'

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
})
