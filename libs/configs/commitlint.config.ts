import { RuleConfigSeverity, UserConfig } from '@commitlint/types'

export const config: UserConfig = {
  parserPreset: 'conventional-changelog-conventionalcommits',
  ignores: [
    (commit: string) => commit.startsWith('BREAKING CHANGE:'),
    (commit: string) => commit.startsWith('BREAKING CHANGES:'),
    (commit: string) => commit.startsWith('BREAKING-CHANGE:'),
    (commit: string) => commit.startsWith('BREAKING-CHANGES:'),
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
