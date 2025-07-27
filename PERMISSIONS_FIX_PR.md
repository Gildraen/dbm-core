# Fix GitHub Actions Permission Error in Release Workflows

## Problem
The GitHub Actions workflows were failing with a permission error:
```
Error calling workflow 'Gildraen/discord-bot-modules-core/.github/workflows/reusable-release.yml@cd75c65a8e0dd3aa571e95fb245dd00da6b09638'. The nested job 'release' is requesting 'contents: write, packages: write', but is only allowed 'contents: read, packages: read'.
```

## Solution
Added explicit permissions to all jobs that call the reusable release workflow. The reusable workflow requires:
- `contents: write` - to create GitHub releases and push tags
- `packages: write` - to publish packages (if needed)

## Changes Made
### Modified Workflows:
1. **`.github/workflows/beta-release.yml`** - Added permissions to `release` job
2. **`.github/workflows/promote-beta.yml`** - Added permissions to `promote` job  
3. **`.github/workflows/stable-release.yml`** - Added permissions to `release` job

### Before:
```yaml
release:
  needs: calculate-version
  uses: ./.github/workflows/reusable-release.yml
  with:
    # ... workflow inputs
  secrets: inherit
```

### After:
```yaml
release:
  needs: calculate-version
  uses: ./.github/workflows/reusable-release.yml
  permissions:
    contents: write
    packages: write
  with:
    # ... workflow inputs
  secrets: inherit
```

## Impact
- ✅ Fixes the GitHub Actions validation error
- ✅ Allows release workflows to execute successfully
- ✅ No functional changes to the release process
- ✅ Maintains security by explicitly declaring required permissions

## Testing
- [ ] Beta release workflow should now pass validation
- [ ] Stable release workflow should now pass validation  
- [ ] Promote beta workflow should now pass validation

## Type of Change
- [x] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
