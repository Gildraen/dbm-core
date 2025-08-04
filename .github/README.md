# CI/CD Setup

This project uses GitHub Actions for continuous integration and deployment to GitHub Package Registry.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**

- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**

- **test**: Runs linting, tests, and builds on all PRs and main pushes

### 2. Beta Release Workflow (`.github/workflows/beta-release.yml`)

**Triggers:**

- Manual trigger via GitHub UI (Actions tab)

**Jobs:**

- **create-beta-release**: Creates beta GitHub releases and publishes beta packages to GitHub Package Registry

### 3. Manual Stable Release Workflow (`.github/workflows/stable-release.yml`)

**Triggers:**
- Manual trigger via GitHub UI (Actions tab)

**Inputs:**
- **Version type**: patch, minor, or major

**Jobs:**
- **calculate-version**: Calculates the next version number
- **release**: Creates GitHub release and publishes package using reusable workflows

### 4. Reusable Release Workflow (`.github/workflows/reusable-release.yml`)

**Purpose:** Core release workflow called by other workflows

**Jobs:**
- **generate-notes**: Generates release notes
- **release**: Creates GitHub release and tag
- **trigger-publish**: Calls the publish workflow to upload package

### 5. Publish to Registry Workflow (`.github/workflows/publish-to-registry.yml`)

**Purpose:** Reusable workflow for publishing packages

**Jobs:**
- **publish**: Builds and publishes package to GitHub Package Registry

### 6. Release Backup Workflow (`.github/workflows/release.yml`)

**Triggers:**

- GitHub release is published (backup/fallback)

**Jobs:**

- **publish**: Backup package publishing with duplicate detection

## Release Process

### For Beta Testing (Manual)

1. Go to your repository's **Actions** tab
2. Select **"Beta Release"** workflow
3. Click **"Run workflow"**
4. Choose the next version type (patch/minor/major)
5. The workflow will create a GitHub pre-release and publish the package to GitHub Package Registry
6. Install with: `yarn add @gildraen/dbm-core@<version>-beta.X --registry=https://npm.pkg.github.com`

### For Stable Release (Manual)

**Option 1: GitHub UI (Recommended)**
1. Go to your repository's **Actions** tab
2. Select **"Manual Stable Release"** workflow
3. Click **"Run workflow"**
4. Choose version type (patch/minor/major)
5. The workflow will automatically:
   - Create a GitHub release 
   - Publish the package to GitHub Package Registry
   - Provide installation instructions

**Option 2: Command Line**
1. Use the release script: `./scripts/release.sh [patch|minor|major]`
2. Or manually:
   - Ensure you're on main branch with clean working directory
   - Calculate the new version (don't modify package.json)
   - Create and push a tag: `git tag v1.2.3 && git push origin v1.2.3`
3. Go to GitHub releases and publish the created tag
4. The reusable release workflow will handle package publishing automatically, with backup fallback

**Note**: The main branch is never modified during releases. Version updates happen only during package publishing.

## Required Secrets

The workflows use the built-in `GITHUB_TOKEN` which has the necessary permissions to publish to GitHub Package Registry.

## Package Installation

To install packages from GitHub Package Registry, users need to:

1. Create a `.npmrc` file in their project with:

```
@gildraen:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

2. Or install directly:

```bash
yarn add @gildraen/dbm-core --registry=https://npm.pkg.github.com
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
