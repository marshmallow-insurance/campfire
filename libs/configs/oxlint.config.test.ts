import { describe, expect, it } from 'vitest'
import config, { nonInheritedConfig } from './oxlint.config.js'

describe('shared oxlint config', () => {
  it('stays app agnostic — no service specific paths or rules', () => {
    // The config is a base for every Marshmallow frontend, so nothing in it may
    // reference a single app's directories.
    expect(JSON.stringify(config)).not.toMatch(
      /src\/features|src\/pages|Fnol|IncidentDetails/,
    )
  })

  it('only declares fields oxlint inherits through `extends`', () => {
    // `Oxlintrc::merge` in oxc keeps the extending config's own `env`, `globals`,
    // `settings` and `ignorePatterns`, so those must not live in the base config.
    expect(Object.keys(config).sort()).toEqual([
      'categories',
      'jsPlugins',
      'overrides',
      'plugins',
      'rules',
    ])
  })

  it('exposes the fields `extends` drops for apps to spread', () => {
    expect(Object.keys(nonInheritedConfig).sort()).toEqual([
      'env',
      'ignorePatterns',
      'settings',
    ])
  })

  it('registers the campfire rules through the campfire js plugin', () => {
    expect(config.jsPlugins).toContainEqual({
      name: 'campfire',
      specifier: '@mrshmllw/campfire/configs/eslint-plugin',
    })
    expect(config.rules).toMatchObject({
      'campfire/no-color-prop': 'warn',
      'campfire/no-theme-colors': 'warn',
    })
  })
})
