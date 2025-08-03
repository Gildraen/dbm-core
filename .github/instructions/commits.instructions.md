---
applyTo: "**"
description: "Conventional commit format and commit message guidelines"
---

# Conventional Commit Guidelines

## Commit Message Structure

```
<type>(<scope>): <description>

[optional body]
[optional footer(s)]
```

## Commit Types

### Primary Types

- **feat**: New feature for the user
- **fix**: Bug fix for the user
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **docs**: Documentation changes
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (deps, build, etc.)
- **perf**: Performance improvements

### Scopes (Examples)

- **migration**: Migration system related changes
- **config**: Configuration management
- **repository**: Data access layer
- **usecase**: Application use cases
- **cli**: Command line interface
- **workflow**: GitHub Actions workflows

## Examples

```
feat(migration): add rollback functionality for failed migrations
fix(config): resolve environment variable validation error
refactor(repository): implement repository pattern with dependency injection
docs(readme): update installation instructions
test(usecase): add unit tests for StartMigration use case
chore(deps): update TypeScript to version 5.3.0
```

## Best Practices

- Use imperative mood in description ("add" not "added")
- Keep first line under 50 characters
- Capitalize first letter of description
- No period at the end of description
- Use body to explain what and why, not how
