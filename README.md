# Campfire

Internal configs, utils, and tooling for Marshmallow projects.

## Install

```bash
npm install -D @mrshmllw/campfire
```

## Configuration

Import and use the pre-configured tools:

```javascript
// eslint.config.js
import { eslintConfig } from '@mrshmllw/campfire'
export default eslintConfig

// prettier.config.js  
import { prettierConfig } from '@mrshmllw/campfire'
export default prettierConfig

// commitlint.config.js
import { commitlintConfig } from '@mrshmllw/campfire'
export default commitlintConfig

// release.config.js
import { releaseConfig } from '@mrshmllw/campfire'
export default releaseConfig

// lint-staged.config.js
import { lintStagedConfig } from '@mrshmllw/campfire'
export default lintStagedConfig
```

### oxlint

Two configs are available — pick one:

| Config | Contents |
|---|---|
| `configs/oxlint.config` | Framework agnostic: TypeScript, promise and vitest rules |
| `configs/oxlint.react.config` | The above plus React, React Perf and JSX a11y plugins, campfire's component rules and `react/react-compiler` |

Spread it into your app's `oxlint.config.ts`:

```ts
// oxlint.config.ts
import campfireConfig from '@mrshmllw/campfire/configs/oxlint.react.config'
import { defineConfig } from 'oxlint'

export default defineConfig({
  ...campfireConfig,
  // App specific config goes here, after the spread
  options: {
    typeAware: true,
  },
})
```

Notes:

- Adding your own `rules`, `plugins` or `overrides` after the spread is safe —
  those arrive via `extends`, so oxlint merges them per rule with your app
  winning on conflict. `env`, `settings` and `ignorePatterns` are plain fields,
  so re-declaring one of those replaces the shared value: spread it if you mean
  to add, e.g. `ignorePatterns: [...campfireConfig.ignorePatterns, 'src/gen/**']`.
- The base config leaves type aware linting to the app: set
  `options.typeAware` and install `oxlint-tsgolint` to switch on the type aware
  rules (`typescript/no-misused-promises`, `typescript/prefer-nullish-coalescing`).
- `extends` with a package import only works in `oxlint.config.ts` /
  `oxlint.config.mts`, not in `.oxlintrc.json`.
- `react/react-compiler` is a nursery rule, so it only runs because the React
  config names it explicitly — enabling categories won't pick it up.

## Development

Use [conventional commits](https://www.conventionalcommits.org/) for automatic changelog generation:

- `fix: description` → patch release
- `feat: description` → minor release  
- `BREAKING CHANGE: description` → major release

## Release

Releases are handled via GitHub Actions on these branches:
- `main` - production releases
- `feature/*`, `chore/*`, `fix/*` - pre-releases

Use the "Bump and Publish" workflow in GitHub Actions to release.
