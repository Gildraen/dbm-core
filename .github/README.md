# CI/CD Setup

This project uses GitHub Actions for continuous integration and deployment to GitHub Package Registry.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**

- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**

- **test**: Runs linting, tests, and builds on all PRs and main pushes

### 2. Beta Release Workflow (`.github/workflows/beta.yml`)

**Triggers:**

- Push to `main` branch only

**Jobs:**

- **publish-beta**: Publishes beta versions to GitHub Package Registry with full CI checks

### 3. Manual Release Workflow (`.github/workflows/manual-release.yml`)

**Triggers:**
- Manual trigger via GitHub UI (Actions tab)

**Inputs:**
- **Version type**: patch, minor, or major
- **Create release**: Whether to create GitHub release automatically
- **Release notes**: Custom release notes (optional, auto-generated if empty)

**Jobs:**
- **create-release**: Runs full CI, calculates version, creates tag, and optionally creates GitHub release

### 4. Release Workflow (`.github/workflows/release.yml`)

**Triggers:**

- GitHub release is published

**Jobs:**

- **publish**: Publishes stable version to GitHub Package Registry with the release tag version

## Release Process

### For Beta Testing (Automatic)

1. Merge PR to `main` branch
2. CI automatically publishes a beta version to GitHub Package Registry with timestamp
3. Install with: `yarn add @dbm/core@beta --registry=https://npm.pkg.github.com`

### For Stable Release (Manual)

**Option 1: GitHub UI (Recommended)**
1. Go to your repository's **Actions** tab
2. Select **"Manual Release"** workflow
3. Click **"Run workflow"**
4. Choose version type (patch/minor/major)
5. Optionally add custom release notes
6. Click **"Run workflow"**
7. The workflow will automatically publish to GitHub Package Registry

**Option 2: Command Line**
1. Use the release script: `./scripts/release.sh [patch|minor|major]`
2. Or manually:
   - Ensure you're on main branch with clean working directory
   - Calculate the new version (don't modify package.json)
   - Create and push a tag: `git tag v1.2.3 && git push origin v1.2.3`
3. Go to GitHub releases and publish the created tag
4. GitHub Action will automatically publish to GitHub Package Registry

**Note**: The main branch is never modified during releases. Version updates happen only in the GitHub Action during publishing.

## Required Secrets

The workflows use the built-in `GITHUB_TOKEN` which has the necessary permissions to publish to GitHub Package Registry.

## Package Installation

To install packages from GitHub Package Registry, users need to:

1. Create a `.npmrc` file in their project with:

```
@dbm:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

2. Or install directly:

```bash
yarn add @dbm/core --registry=https://npm.pkg.github.com
```

## Package Scripts

- `yarn test` - Run tests
- `yarn lint:check` - Check linting
- `yarn lint` - Fix linting issues
- `yarn build` - Build the package
- `yarn compile` - Clean and build

## Beta Versions

Beta versions are automatically created from main branch with format:

```
1.0.0-beta.20250126143022
```

These allow testing integration changes before stable releases.
