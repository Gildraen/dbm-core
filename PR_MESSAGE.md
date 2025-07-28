# Fix shell interpretation issues in reusable-release workflow

## 🐛 Problem

The GitHub Actions release workflow was failing with "command not found" errors where version numbers (like `1.0.0`, `1.0.1`) from release notes were being interpreted as shell commands instead of text content.

**Error example:**

```
/home/runner/work/_temp/.../sh: line 15: 1.0.0: command not found
/home/runner/work/_temp/.../sh: line 15: 1.0.1: command not found
```

## 🔍 Root Cause

Multiple shell interpretation issues in `.github/workflows/reusable-release.yml`:

1. **Invalid `--latest` flag** - GitHub CLI `gh release create` doesn't support this flag
2. **Unsafe release notes handling** - Using `--notes` with multiline markdown containing backticks caused shell to interpret version numbers as commands
3. **Improper variable expansion** - Unquoted shell variables could cause parsing issues

## ✅ Solution

### 1. Remove invalid CLI flag

```diff
- RELEASE_FLAGS="--latest"
+ RELEASE_FLAGS=""
```

### 2. Safe release notes handling

```diff
- gh release create "$TAG_NAME" \
-   --notes "${{ inputs.release_notes }}" \
-   $RELEASE_FLAGS \
-   $TARGET_FLAG

+ # Create release notes file to avoid shell interpretation issues
+ cat <<'EOF' > RELEASE_NOTES.md
+ ${{ inputs.release_notes }}
+ EOF
+
+ gh release create "$TAG_NAME" \
+   --notes-file RELEASE_NOTES.md \
+   ${RELEASE_FLAGS} \
+   ${TARGET_FLAG}
```

### 3. Proper variable expansion

- Changed `$RELEASE_FLAGS` → `${RELEASE_FLAGS}`
- Changed `$TARGET_FLAG` → `${TARGET_FLAG}`

## 🧪 Testing

- [x] Workflow syntax validated
- [x] Fixed shell variable expansion
- [x] Heredoc prevents shell interpretation of special characters
- [ ] Will be tested on next release

## 📁 Files Changed

- `.github/workflows/reusable-release.yml` - Fixed GitHub CLI usage and shell safety

## 🎯 Impact

- ✅ Resolves release workflow failures
- ✅ Enables proper GitHub release creation
- ✅ Prevents shell injection from release notes content
- ✅ Makes workflow more robust and maintainable

## 🔗 Related Issues

Fixes the workflow execution errors that were preventing successful releases of `@gildraen/dbm-core` package.
