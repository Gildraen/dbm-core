# Conventional Commit Format & Guidelines

## 📝 Commit Message Structure

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Examples

```bash
feat(migration): add rollback functionality for failed migrations
fix(config): resolve environment variable validation error
refactor(repository): implement repository pattern with dependency injection
docs(readme): update installation instructions for GitHub Package Registry
test(usecase): add unit tests for StartMigration use case
chore(deps): update TypeScript to version 5.3.0
```

## 🏷️ Commit Types

### Primary Types

- **feat**: New feature for the user
- **fix**: Bug fix for the user
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **docs**: Documentation changes
- **test**: Adding missing tests or correcting existing tests
- **chore**: Maintenance tasks, dependency updates

### Secondary Types

- **perf**: Performance improvement
- **style**: Code style changes (formatting, missing semicolons, etc)
- **build**: Changes to build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **revert**: Reverts a previous commit

## 📂 Scope Guidelines

### Domain Scopes

- **migration**: Migration system functionality
- **config**: Configuration management
- **module**: Module loading and management
- **repository**: Data access layer

### Infrastructure Scopes

- **cli**: Command line interfaces
- **db**: Database related changes
- **workflow**: GitHub Actions workflows
- **build**: Build system changes

### Application Scopes

- **usecase**: Application use cases
- **service**: Application services
- **validation**: Input validation logic

## ✍️ Description Guidelines

### Good Descriptions

- Use imperative mood ("add" not "added" or "adds")
- Start with lowercase letter
- No period at the end
- Be concise but descriptive
- Explain what the change does, not how

### Examples

```bash
# ✅ Good
feat(migration): add rollback functionality
fix(config): resolve validation error for missing env vars
refactor(repository): extract interface for testability

# ❌ Avoid
feat(migration): Added some rollback stuff
fix(config): Fixed the bug
refactor(repository): Refactored the code
```

## 📄 Body Guidelines

Use the body to explain:

- **What** changed
- **Why** the change was made
- **How** it affects existing functionality

### Format

- Wrap at 72 characters
- Use bullet points for multiple changes
- Reference issues/PRs when relevant

### Example

```
feat(migration): add rollback functionality

- Implement rollback command for failed migrations
- Add validation to prevent rollback of applied migrations
- Include rollback history tracking
- Update CLI to support rollback operations

Resolves #123
```

## 🔗 Footer Guidelines

### Breaking Changes

```
feat(config): change default configuration format

BREAKING CHANGE: Configuration files now require YAML format instead of JSON.
Migration guide available in docs/migration.md
```

### Issue References

```
fix(repository): resolve connection timeout issue

Fixes #456
Closes #789
Refs #101
```

## 🚀 Advanced Examples

### Feature Addition

```
feat(module): implement hot-swappable module system

- Add ModuleLoader with dependency injection
- Support for module configuration validation
- Implement module lifecycle management (load/unload)
- Add error recovery for failed module loads

The system allows loading/unloading modules without bot restart,
improving development experience and reducing downtime.

Closes #234
```

### Bug Fix

```
fix(config): resolve race condition in config loading

The ConfigManager was susceptible to race conditions when
multiple async operations tried to load configuration
simultaneously. Added proper locking mechanism to ensure
thread-safe configuration initialization.

Fixes #567
```

### Refactoring

```
refactor(repository): extract repository interface

- Create MigrationRepository interface
- Implement PrismaMigrationRepository
- Update use cases to depend on interface
- Add comprehensive mocking in tests

This change improves testability and follows Clean Architecture
principles by inverting dependencies.
```

### Documentation

```
docs(readme): update installation for GitHub Package Registry

- Add authentication setup instructions
- Include example .npmrc configuration
- Update package installation commands
- Add troubleshooting section for common issues
```

## 🎯 Best Practices

### Atomic Commits

- One logical change per commit
- If you use "and" in description, consider splitting
- Each commit should pass tests independently

### Message Quality

- Write for future developers (including yourself)
- Explain the "why" not just the "what"
- Use present tense, imperative mood
- Keep first line under 50 characters if possible

### Consistency

- Follow project conventions consistently
- Use established scope names
- Maintain similar description patterns

## 🚫 Anti-Patterns

### Avoid These

```bash
# Too vague
fix: bug fix
feat: new feature
update: updates

# Too technical
fix: change line 42 in ConfigManager.ts
refactor: move function from A to B

# Wrong tense
fix: fixed the config bug
feat: added new migration system

# Missing context
docs: update
test: tests
chore: stuff
```

## 🔍 Review Checklist

Before committing, verify:

- [ ] Type is appropriate for the change
- [ ] Scope accurately describes affected area
- [ ] Description is clear and concise
- [ ] Body explains motivation if needed
- [ ] Footer includes issue references
- [ ] Message follows imperative mood
- [ ] No typos or grammatical errors
