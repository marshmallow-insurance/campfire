import { readFileSync } from 'fs'
import path from 'path'

const branch = process.env.GITHUB_REF_NAME

/**
 * Attempt to determine the repository URL.
 * By loading it from the consumer project's package.json.
 * If the URL starts with 'git+', remove that prefix.
 */
function getRepositoryUrl() {
  try {
    // process.cwd() will point to the consumer repo when semantic-release runs
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    const packageJson = readFileSync(packageJsonPath, 'utf8')
    const pkg = JSON.parse(packageJson)

    if (pkg.repository) {
      let url =
        typeof pkg.repository === 'object' ? pkg.repository.url : pkg.repository

      // Remove "git+" prefix if it exists
      if (typeof url === 'string' && url.startsWith('git+')) {
        url = url.slice(4)
      }
      return url
    }
  } catch (err) {
    console.warn('Unable to load repository URL from package.json:', err)
  }
  return undefined
}

const repositoryUrl = getRepositoryUrl()

/**
 * @type {import('semantic-release').GlobalConfig}
 */
const config = {
  branches: [
    'main',
    {
      name: '(feature|fix|chore)/*',
      // The prerelease name uses a dynamic expression to replace '/' with '-'
      prerelease: 'crumbs-${name.replace(/\\//g, "-")}',
    },
  ],
  repositoryUrl,
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        releaseRules: [
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'docs', release: 'patch' },
          { type: 'bump', release: 'patch' },
          { type: 'dependabot', release: 'patch' },
          { type: 'style', release: 'patch' },
          { type: 'refactor', release: 'patch' },
          { type: 'perf', release: 'patch' },
          { type: 'test', release: 'patch' },
          { type: 'revert', release: 'patch' },
          { type: 'chore', release: 'patch' },
        ],
        parserOpts: {
          noteKeywords: [
            'BREAKING CHANGE',
            'BREAKING-CHANGE',
            'BREAKING CHANGES',
            'BREAKING-CHANGES',
          ],
        },
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            { type: 'feat', section: 'Features' },
            { type: 'fix', section: 'Bug Fixes' },
            { type: 'docs', section: 'Documentation' },
            { type: 'bump', hidden: true },
            { type: 'dependabot', hidden: true },
            { type: 'style', section: 'Styles' },
            { type: 'refactor', section: 'Refactors' },
            { type: 'perf', section: 'Performance Improvements' },
            { type: 'test', section: 'Tests' },
            { type: 'revert', hidden: true },
            { type: 'chore', hidden: true },
            { type: '*', section: 'Others' },
          ],
        },
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: ['dist'],
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        pkgRoot: '.',
      },
    ],
  ],
}

// Only add the changelog and git plugins on release (not for prereleases)
const isPrereleaseBranch = config.branches.some(
  (b) => typeof b === 'object' && branch !== 'main' && b.prerelease,
)

if (!isPrereleaseBranch) {
  config.plugins.push('@semantic-release/changelog', [
    '@semantic-release/git',
    {
      assets: ['package.json', 'package-lock.json', 'CHANGELOG.md'],
      message:
        'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    },
  ])
}

export default config
