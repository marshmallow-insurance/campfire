# Campfire

`campfire` is a collection internal configs, utils, and bits and pieces

## Install

```bash
$ npm install -D @mrshmllw/campfire
```

## Usage

### ESLint Configuration

```javascript
// eslint.config.js
import { eslintConfig } from '@mrshmllw/campfire'

export default eslintConfig
```

Or extend it:

```javascript
// eslint.config.js
import { eslintConfig } from '@mrshmllw/campfire'

export default [
  ...eslintConfig,
  {
    // Your custom rules
    rules: {
      'no-console': 'error'
    }
  }
]
```

### Prettier Configuration

```javascript
// prettier.config.js
import { prettierConfig } from '@mrshmllw/campfire'

export default prettierConfig
```

### Commitlint Configuration

```javascript
// commitlint.config.js
import { commitlintConfig } from '@mrshmllw/campfire'

export default commitlintConfig
```

### Semantic Release Configuration

```javascript
// release.config.js
import { releaseConfig } from '@mrshmllw/campfire'

export default releaseConfig
```

### Lint-staged Configuration

```javascript
// lint-staged.config.js
import { lintStagedConfig } from '@mrshmllw/campfire'

export default lintStagedConfig
```

### Direct Config Access

You can also import configs directly:

```javascript
import eslintConfig from '@mrshmllw/campfire/configs/eslint.config.js'
import prettierConfig from '@mrshmllw/campfire/configs/prettier.config.js'
```

## GitHub Workflow Templates

Campfire includes standardized GitHub workflow templates that you can copy to your repositories:

### Available Workflows

1. **CI Workflow** (`workflows/ci.yml`)
   - Runs on pull requests and main branch pushes
   - Performs linting, type checking, testing, and building
   - Requires: `lint`, `check-types`, `test`, `build` scripts in package.json

2. **Release Workflow** (`workflows/release.yml`)
   - Manual workflow dispatch with optional dry-run mode
   - Handles semantic versioning and NPM publishing
   - Supports feature branch prereleases
   - Requires: semantic-release configuration

3. **Auto-merge Dependabot** (`workflows/auto-merge-dependabot.yml`)
   - Automatically approves and merges Dependabot PRs
   - Only merges after CI passes
   - Requires: Marshmallow CI app configuration

4. **Deploy Preview** (`workflows/deploy-preview.yml`)
   - Deploys preview environments for pull requests
   - Supports Vercel and Netlify (commented alternative)
   - Requires: deployment service configuration

### Setup Instructions

1. **Copy workflow files to your repository:**
   ```bash
   # Create workflows directory
   mkdir -p .github/workflows
   
   # Copy the workflows you need
   cp node_modules/@mrshmllw/campfire/dist/workflows/ci.yml .github/workflows/
   cp node_modules/@mrshmllw/campfire/dist/workflows/release.yml .github/workflows/
   cp node_modules/@mrshmllw/campfire/dist/workflows/auto-merge-dependabot.yml .github/workflows/
   ```

   **Or use the CLI tool (recommended):**
   ```bash
   # Copy all workflows
   npx campfire-setup-workflows
   
   # Copy specific workflows
   npx campfire-setup-workflows ci release
   
   # See available options
   npx campfire-setup-workflows --help
   ```

2. **Ensure your package.json has the required scripts:**
   ```json
   {
     "scripts": {
       "lint": "eslint .",
       "check-types": "tsc --noEmit",
       "test": "vitest run",
       "build": "vite build"
     }
   }
   ```

3. **Add required secrets/variables to your repository:**
   - `MARSHMALLOW_CI_APP_ID` (repository variable)
   - `MARSHMALLOW_CI_APP_PRIVATE_KEY` (repository secret)
   - `NPM_TOKEN` (repository secret, for release workflow)
   - Deployment secrets (for preview workflow)

### Workflow Features

- **Consistent Node.js setup** with `.nvmrc` support and npm caching
- **Branch protection** for release workflows
- **Semantic release** integration with conventional commits
- **Automatic Dependabot management**
- **Preview deployments** for pull requests
- **Proper permissions** and security practices

## Making changes

When making changes and creating PR's we use
[semantic-releases](https://www.npmjs.com/package/semantic-release) which make
use of [conventional-commits](https://www.conventionalcommits.org/en/v1.0.0/).

So to ensure our CHANGELOG.md is updated automatically and gets the changes we
have made, we just need to name our PR's following this convention (casing
matters): e.g

1. patch - fix(OPTIONAL bugfix-reference): some bugfix
2. minor - feat(OPTIONAL feature-reference): some feature
3. major - BREAKING CHANGE: some breaking change

## Release

Only the following branches are supported for release:

- `main`
- `feature/*`
- `chore/*`
- `fix/*`

#### Preview

Before releasing, you may want to see the changes that will be included in the
next version deployed on NPM, you can do so by:

1. Goto our
   [github workflows](https://github.com/marshmallow-insurance/campfire/actions)
2. Click `Preview Bump and Publish`
3. Press `Run workflow` and select the `main` branch.
4. Wait for the `Generate preview CHANGELOG.md` and look at the results!

#### Releasing & Publishing

When you're happy with your changes, you can release & publish your changes to
NPM in one fell swoop by:

1. Goto our
   [github workflows](https://github.com/marshmallow-insurance/campfire/actions)
2. Click `Bump and Publish`
3. Press `Run workflow` and select the `main` branch.
4. Wait for release!

> [!NOTE] this workflow will fail if the package version is already on the latest, so you dont have to worry about deploying the same changes multiple times.

> [!IMPORTANT] When re-using the release.config in other repos, you need to ensure that the package.json includes a repository URL.

#### Pre-Releases

Not too different to your usual workflow!

1. Checkout a new branch with the prefix
   `(feature|chore|fix)/<your-branch-name>` e.g. `feature/awesome-new-feature`
2. Open a PR and create your changes as normal using semantic-commits!
3. Goto our
   [github workflows](https://github.com/marshmallow-insurance/campfire/actions)
4. Click `Bump and Publish` or `Preview Bump and Publish`
5. Press `Run workflow` and select `<your-full-branch-name>` branch.
6. Wait for release!
7. This can be done multiple times and it will increment your pre-release
   package version!
8. When you're happy with the changes, simply squash and merge the PR and
   release `main`!
