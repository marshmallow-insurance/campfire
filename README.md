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

Extend the shared base config from your app's `oxlint.config.ts`:

```ts
// oxlint.config.ts
import campfireConfig, {
  nonInheritedConfig,
} from '@mrshmllw/campfire/configs/oxlint.config'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [campfireConfig],
  ...nonInheritedConfig,
  // App specific config goes here, after the spread so it wins
  options: {
    typeAware: true,
  },
})
```

Notes:

- The spread is required: oxlint keeps only the extending config's `env`,
  `globals`, `settings` and `ignorePatterns`, so those fields are exported
  separately as `nonInheritedConfig` instead of being silently dropped.
- `rules`, `categories`, `plugins`, `jsPlugins`, `overrides` and `options` are
  inherited, with the app's values winning on conflict.
- The base config leaves type aware linting to the app: set
  `options.typeAware` and install `oxlint-tsgolint` to switch on the type aware
  rules (`typescript/no-misused-promises`, `typescript/prefer-nullish-coalescing`).
- `extends` with a package import only works in `oxlint.config.ts` /
  `oxlint.config.mts`, not in `.oxlintrc.json`.

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
