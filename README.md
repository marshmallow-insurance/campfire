# Campfire

`campfire` is a collection internal configs, utils, and bits and pieces

## Install

```bash
$ npm install -D @mrshmllw/campfire
```

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
