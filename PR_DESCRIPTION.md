# 🚀 Refactor Release Workflows: Modular, Reusable Beta & Release System

## 📋 **Overview**

This PR completely refactors our release system from a single monolithic workflow into focused, reusable workflows that support proper beta testing and release promotion workflows.

## 🎯 **What's Changed**

### ❌ **Removed**
- `manual-release.yml` - Monolithic 300+ line workflow with complex conditional logic
- `beta.yml` - Auto-beta on push with timestamp-based versions (conflicted with semantic versioning)

### ✅ **Added**
- `reusable-release.yml` - Core release logic shared by all workflows
- `stable-release.yml` - Manual stable releases (patch/minor/major)
- `beta-release.yml` - Manual beta releases with semantic versioning
- `promote-beta.yml` - Promote tested betas to stable releases
- `dev-build.yml` - Automatic dev builds on main branch (replaces auto-beta)
- `README.md` - Comprehensive workflow documentation

## 🔄 **New Workflow Structure**

```
┌─────────────────────┐
│ reusable-release.yml│ ← Core logic used by all
└─────────────────────┘
           ↑
   ┌───────┼───────┐
   │       │       │
┌──▼──┐ ┌──▼──┐ ┌──▼──┐
│Stable│ │Beta │ │Promote│
└─────┘ └─────┘ └──────┘
```

## 🎮 **Release Channels**

1. **`@dev`** (automatic): `1.0.0-dev.a1b2c3d` - Every main commit
2. **`@beta`** (manual): `1.1.0-beta.1` - Planned feature testing  
3. **`@latest`** (manual): `1.0.0` - Stable releases

## 📖 **Usage Examples**

### 🧪 **Beta Testing Flow**
```bash
# 1. Create beta for testing
GitHub Actions → "Beta Release" → select "minor" → creates 1.1.0-beta.1

# 2. Test the beta
yarn add @gildraen/dbm-core@1.1.0-beta.1

# 3. Create another beta if needed
GitHub Actions → "Beta Release" → select "minor" → creates 1.1.0-beta.2

# 4. Promote stable release
GitHub Actions → "Promote Beta to Stable" → input "1.1.0-beta.2" → creates 1.1.0
```

### 🚀 **Direct Release Flow**
```bash
# Direct stable release (no beta testing)
GitHub Actions → "Manual Stable Release" → select "patch" → creates 1.0.1
```

## 🛡️ **Safety Features**

- ✅ **Validation**: Promote workflow validates beta exists and isn't already stable
- ✅ **Pre-release marking**: Beta releases marked as pre-releases
- ✅ **Build reuse**: Promote workflow skips rebuild (reuses beta build)
- ✅ **Error handling**: Clear error messages for invalid inputs
- ✅ **Semantic versioning**: Proper semver for all releases

## 🎉 **Benefits**

- **🎯 Focused**: Each workflow has a single, clear purpose
- **🔄 Reusable**: Common logic centralized, DRY principle
- **🧪 Testable**: Beta releases allow thorough testing before stable
- **📝 Maintainable**: Smaller files, easier to understand and modify
- **🚀 Flexible**: Support for different release strategies
- **🛡️ Safe**: Validation prevents common release mistakes

## 🔧 **Technical Details**

### Reusable Workflow Pattern
- Core logic in `reusable-release.yml` 
- Called by specific workflows with different parameters
- Supports conditional build skipping for promotions
- Handles both pre-releases and stable releases

### Version Calculation
- **Stable**: Based on latest stable release + version bump
- **Beta**: Based on next stable version + beta counter
- **Promote**: Extracts stable version from beta (removes `-beta.X`)

### Dev Builds
- Automatic on every main push
- Uses commit SHA for traceability
- Published to `@dev` tag
- Separate from planned beta releases

## 📋 **Migration Notes**

### For Maintainers
- Use "Manual Stable Release" instead of old manual-release workflow
- Use "Beta Release" for testing new features
- Use "Promote Beta to Stable" after testing

### For Users
- `@latest` - Stable releases (unchanged)
- `@beta` - Now semantic versions instead of timestamps
- `@dev` - New channel for development builds

## 🧪 **Testing**

This PR includes comprehensive documentation and follows established patterns. The workflows are ready for testing with the next release cycle.

---

## 📊 **Files Changed**

- ➕ `.github/workflows/reusable-release.yml` (Core logic)
- ➕ `.github/workflows/stable-release.yml` (Manual stable releases)  
- ➕ `.github/workflows/beta-release.yml` (Manual beta releases)
- ➕ `.github/workflows/promote-beta.yml` (Promote beta to stable)
- ➕ `.github/workflows/dev-build.yml` (Auto dev builds)
- ➕ `.github/workflows/README.md` (Documentation)
- ❌ `.github/workflows/manual-release.yml` (Removed monolithic workflow)
- 🔄 `.github/workflows/beta.yml` → `.github/workflows/dev-build.yml` (Renamed/refactored)

**BREAKING CHANGE**: The manual-release workflow has been replaced with separate focused workflows.
