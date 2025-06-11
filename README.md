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
