---
applyTo: "**"
description: "GitHub platform behavior patterns and workarounds"
---

# GitHub Platform Behavior

## 🔍 Copilot Review Behavior

### Review Persistence

- **Copilot reviews are tied to specific commit hashes**
- **Reviews may appear "unresolved" even after fixes are applied in later commits**
- **This is normal GitHub behavior - not an indication that fixes weren't applied**

### Verification Process

When Copilot feedback appears unresolved:

1. Check if fixes exist in commits after the reviewed commit
2. Verify actual code state matches the suggested improvements
3. Don't re-apply fixes that are already implemented

## 📊 PR Information Accuracy

### Reliable Sources (Real-time)

- **Files tab** (`/pull/N/files`): Current file changes and commit count
- **Commits tab** (`/pull/N/commits`): Complete commit history
- **Individual commit pages**: Specific change details

### Potentially Stale Sources

- **Main conversation tab** (`/pull/N`): May cache commit counts and review status
- **Review comments**: May not reflect fixes in subsequent commits

## 🎯 Best Practices

- **Cross-reference multiple tabs** when analyzing PR status
- **Focus on actual code state** rather than review interface status
- **Use commits tab for accurate commit counting**
- **Verify fixes in code before assuming they need re-application**
