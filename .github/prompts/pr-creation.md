# Pull Request Creation Workflow

## 🔍 Pre-PR Analysis Process

When creating a pull request, **ALWAYS** follow this analysis workflow:

### 1. Diff Analysis

```bash
# Check all changes from main branch
git diff main...HEAD --name-only
git diff main...HEAD
```

**Required Analysis:**

- List all modified/added/deleted files
- Identify scope of changes (feature, fix, refactor, docs)
- Check for breaking changes
- Verify test coverage for new code

### 2. Impact Assessment

- **Architecture**: Does this follow Clean Architecture?
- **Dependencies**: Any new dependencies or version changes?
- **Configuration**: Changes to config files, scripts, or workflows?
- **Documentation**: Does README or docs need updates?

## 📝 PR Title Format

Use **Conventional Commit** format:

```
<type>(<scope>): <description>

Examples:
feat(migration): add database rollback functionality
fix(config): resolve environment variable loading issue
refactor(repository): implement repository pattern
docs(readme): update installation instructions
chore(deps): update dependencies to latest versions
```

### Type Categories

- **feat**: New feature
- **fix**: Bug fix
- **refactor**: Code restructuring without functionality change
- **docs**: Documentation updates
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **perf**: Performance improvements
- **style**: Code style changes

## 📋 PR Description Template

```markdown
## 🎯 Purpose

Brief description of what this PR accomplishes.

## 📊 Changes Summary

- **Files Modified**: X files
- **Type**: [feature/fix/refactor/docs/chore]
- **Breaking Changes**: [Yes/No]

## 🔍 Detailed Changes

### Added

- List new features/files

### Modified

- List changed functionality

### Removed

- List deleted code/features

## 🧪 Testing

- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## 📚 Documentation

- [ ] README updated if needed
- [ ] Code comments added/updated
- [ ] Type definitions updated

## 🔄 Migration Notes

(If applicable)

- Database changes required
- Configuration updates needed
- Breaking changes for users

## ✅ Checklist

- [ ] Code follows project standards
- [ ] ESLint passes without errors
- [ ] TypeScript compiles successfully
- [ ] All tests pass
- [ ] No sensitive data exposed
```

## 🎯 Quality Checks

Before submitting PR, verify:

### Code Quality

- [ ] ESLint configuration passes
- [ ] TypeScript strict mode compliance
- [ ] Proper error handling implemented
- [ ] Clean Architecture principles followed

### Testing

- [ ] Unit tests for new functionality
- [ ] Integration tests updated if needed
- [ ] Mock strategies properly implemented
- [ ] Test coverage maintained or improved

### Documentation

- [ ] JSDoc comments for public APIs
- [ ] README reflects any new features
- [ ] Configuration examples updated
- [ ] Migration guides provided if needed

## 🚀 PR Size Guidelines

**Preferred PR Size:**

- **Small**: < 200 lines changed (ideal)
- **Medium**: 200-500 lines changed (acceptable)
- **Large**: > 500 lines changed (needs justification)

**For Large PRs:**

- Provide detailed explanation
- Consider breaking into smaller PRs
- Include comprehensive testing
- Add detailed migration notes

## 🔄 Review Process

### Self-Review Checklist

1. Read through all changes as a reviewer would
2. Verify commit messages follow conventions
3. Check for any debugging code or console.logs
4. Ensure no secrets or sensitive data included
5. Validate all tests pass locally

### Response to Feedback

- Address all reviewer comments
- Update PR description if scope changes
- Re-run tests after changes
- Thank reviewers for their time

## 🎨 Best Practices

### Commit Strategy

- Use atomic commits (one logical change per commit)
- Write descriptive commit messages
- Keep commits focused and reviewable

### Branch Naming

```
feature/add-rollback-functionality
fix/config-loading-error
refactor/repository-pattern
docs/update-installation-guide
```

### Communication

- Use clear, professional language
- Explain complex decisions in comments
- Link to relevant issues or discussions
- Provide context for reviewers
