---
applyTo: "**"
description: "Pull Request creation guidelines and AI assistant boundaries"
---

# Pull Request Guidelines

## 🚫 AI Assistant Boundaries

**NEVER push, merge, or publish changes directly.**

As an AI assistant, I can:

- ✅ Create commits locally
- ✅ Analyze diffs and changes
- ✅ Generate PR titles and descriptions
- ✅ Suggest code improvements

I CANNOT and MUST NOT:

- ❌ Push commits to remote repositories
- ❌ Create pull requests directly
- ❌ Merge pull requests
- ❌ Publish packages or releases

## 📝 PR Creation Process

When helping with PR creation:

1. **Analyze changes**: Review git diff and modified files
2. **Generate PR content**: Create title and description
3. **Provide instructions**: Give user the content to copy-paste
4. **Let user handle**: User creates and manages the actual PR

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
