import { RuleConfigSeverity, UserConfig } from '@commitlint/types'

export const config: UserConfig = {
  parserPreset: 'conventional-changelog-conventionalcommits',
  ignores: [
    // Allow breaking changes in subject line with all case and format variations:
    // - BREAKING CHANGE:, breaking change:, Breaking Change:, etc.
    // - BREAKING-CHANGE:, breaking-change:, Breaking-Change:, etc.
    // - BREAKING CHANGES:, breaking changes:, Breaking Changes:, etc.
    // - BREAKING-CHANGES:, breaking-changes:, Breaking-Changes:, etc.
    (commit: string) =>
      /^breaking[\s-]change(?:s)?:/i.test(commit),
  ],
  rules: {
    'type-case': [RuleConfigSeverity.Error, 'always', 'lower-case'],
    'type-empty': [RuleConfigSeverity.Error, 'never'],
    'type-enum': [
      RuleConfigSeverity.Error,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'bump',
        'dependabot',
        'refactor',
        'style',
        'perf',
        'test',
        'revert',
        'chore',
      ],
    ],
  },
}

export default config
