---
applyTo: "**"
description: "Pull Request creation guidelines and AI assistant boundaries"
---

# Pull Request Guidelines

## 🚫 AI Assistant Boundaries

**NEVER push, merge, or publish changes directly.**

As an AI assistant, I can:

- ✅ Create commits locally **ONLY when explicitly requested by user**
- ✅ Analyze diffs and changes
- ✅ Generate PR titles and descriptions
- ✅ Suggest code improvements

I CANNOT and MUST NOT:

- ❌ Push commits to remote repositories
- ❌ Create pull requests directly
- ❌ Merge pull requests
- ❌ Publish packages or releases
- ❌ **Commit PR messages to the repository** (they are for GitHub PR creation only)
- ❌ **Make commits without explicit user request** (always ask first)

## 🔄 Commit Guidelines

- **Ask first**: Always ask user before creating any commits
- **Wait for approval**: Never commit automatically, even for obvious fixes
- **User-driven**: Commits should only happen when user explicitly requests them
- **Explain changes**: Describe what will be committed before doing it

## 🔍 Getting Fresh PR Information

When analyzing PRs, GitHub's main conversation page may show cached information. For current status:

- **✅ Use `/files` tab**: Shows real-time file changes and accurate commit count
- **✅ Use `/commits` tab**: Shows complete, current commit history
- **❌ Avoid main conversation tab**: Often cached/stale for commit counts and reviews

## 🔄 Consistency Verification

When making improvements to code patterns:

- **Check similar files**: If updating one file, verify similar files follow same patterns
- **Maintain consistency**: Apply same coding standards across similar components
- **Test thoroughly**: Run full test suite after consistency changes

## 📝 PR Creation Process

When helping with PR creation:

1. **Analyze changes**: Review git diff and modified files
2. **Generate PR content**: Create title and description (provide as text, never commit to repository)
3. **Provide instructions**: Give user the content to copy-paste into GitHub
4. **Let user handle**: User creates and manages the actual PR

**Important**: PR messages should never be committed to the repository - they are exclusively for GitHub PR creation.

## 🏷️ PR Title Format

Use conventional commit format:

```
<type>(<scope>): <description>

Examples:
feat(migration): add rollback functionality
fix(config): resolve validation error
docs(readme): update installation guide
```

## 📋 PR Description Template

Keep it concise but informative:

```markdown
## Purpose

Brief description of what this PR accomplishes.

## Changes

- List key changes made
- Highlight any breaking changes
- Note new dependencies or configuration

## Testing

- [ ] All tests pass
- [ ] New functionality tested
- [ ] No regressions introduced

## Notes

Any additional context or migration steps needed.
```

## ✅ Quality Checklist

Before creating PR:

- Code follows TypeScript strict mode
- Tests added for new functionality
- ESLint passes without errors
- Clean Architecture principles followed
- Documentation updated if needed
