# Release Workflows Overview

This repository now uses a modular approach to releases with focused, reusable workflows.

## 🔧 Workflows

### 1. `reusable-release.yml` - Core Release Logic

**Type**: Reusable workflow
**Purpose**: Contains common release functionality used by other workflows

**Inputs**:

- `version`: Version to release (e.g., "1.2.3")
- `is_prerelease`: Whether this is a pre-release (default: false)
- `release_notes`: Custom release notes
- `target_commitish`: Target commit/tag for the release
- `skip_build`: Skip build steps (useful for promotions)

**What it does**:

- Builds, tests, and lints (unless skipped)
- Creates and pushes git tag
- Creates GitHub release
- Provides summary

### 2. `stable-release.yml` - Manual Stable Releases

**Type**: Manual workflow (`workflow_dispatch`)
**Purpose**: Create new stable releases with automatic version bumping

**Inputs**:

- `version_type`: patch/minor/major
- `release_notes`: Optional custom notes

**Process**:

1. Calculates next version based on latest stable release
2. Generates release notes with commit history
3. Calls reusable workflow to create release

### 3. `beta-release.yml` - Beta Testing Releases

**Type**: Manual workflow (`workflow_dispatch`)
**Purpose**: Create beta versions for testing upcoming features

**Inputs**:

- `next_version_type`: What the final stable version will be (patch/minor/major)
- `release_notes`: Optional custom notes

**Process**:

1. Calculates next stable version
2. Creates beta version (e.g., `1.3.0-beta.1`, `1.3.0-beta.2`)
3. Creates pre-release on GitHub

**Example**: If current stable is `1.2.0` and you select `minor`, it creates `1.3.0-beta.1`

### 4. `promote-beta.yml` - Promote Beta to Stable

**Type**: Manual workflow (`workflow_dispatch`)
**Purpose**: Promote a tested beta version to stable release

**Inputs**:

- `beta_version`: Beta version to promote (e.g., "1.3.0-beta.2")
- `release_notes`: Optional custom notes

**Process**:

1. Validates the beta version exists and is a pre-release
2. Extracts stable version (removes `-beta.X` suffix)
3. Creates stable release pointing to the same commit as beta
4. Skips build steps (reuses beta build)

### 5. `release.yml` - Automatic Releases

**Type**: Automatic workflow (triggers on release published)
**Purpose**: Automatically publish to GitHub Package Registry when a release is created

**Process**:

- Triggered when any GitHub release is published
- Builds and publishes package to GitHub Package Registry
- Updates package.json version to match release tag

## 🚀 Usage Examples

### Normal Release Flow

1. **Create Beta**: Use "Beta Release" → select `minor` → creates `1.3.0-beta.1`
2. **Test Beta**: Install and test `yarn add @gildraen/dbm-core@1.3.0-beta.1`
3. **Promote**: Use "Promote Beta to Stable" → input `1.3.0-beta.1` → creates `1.3.0`

### Direct Release (no beta testing)

1. **Direct Release**: Use "Manual Stable Release" → select `patch` → creates stable release

### Emergency Hotfix

1. **Hotfix**: Use "Manual Stable Release" → select `patch` → immediate stable release

## 🔄 Benefits of This Structure

- **🎯 Focused**: Each workflow has a single, clear purpose
- **🔄 Reusable**: Common logic centralized in reusable workflow
- **🧪 Testable**: Beta releases allow thorough testing before stable
- **🛡️ Safe**: Validation prevents promoting non-existent or already-stable versions
- **📝 Maintainable**: Smaller, easier to understand and modify workflows
- **🚀 Flexible**: Support for different release strategies
