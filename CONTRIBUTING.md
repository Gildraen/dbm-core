# Contributing to Discord Bot Core

Thank you for your interest in contributing to Discord Bot Core! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our code of conduct:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Provide constructive feedback
- Focus on the community and project goals

## 🚀 Getting Started

### Prerequisites

- Node.js 22+ LTS
- Yarn package manager
- Git
- Basic knowledge of TypeScript and Clean Architecture

### Development Setup

1. **Fork the repository**

   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/discord-bot-modules-core.git
   cd discord-bot-modules-core
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

4. **Make your changes**
   - Follow the coding standards (see below)
   - Add tests for new functionality
   - Update documentation as needed

5. **Test your changes**

   ```bash
   yarn test
   yarn lint:check
   yarn build
   ```

6. **Commit and push**

   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Use the PR template
   - Provide clear description of changes
   - Link related issues

## 📝 Coding Standards

### Architecture Principles

Follow **Clean Architecture** patterns:

- **Domain Layer**: Core business logic (no external dependencies)
- **Application Layer**: Use cases and orchestration
- **Infrastructure Layer**: External concerns (database, CLI, APIs)

### TypeScript Guidelines

- Use strict TypeScript settings
- Prefer explicit types over `any`
- Use interfaces for extensibility
- Export types and interfaces properly

### File Organization

```
src/
├── domain/           # Core business logic
│   ├── interface/    # Domain interfaces
│   ├── types/        # Domain types
│   └── config/       # Configuration schemas
├── application/      # Use cases
│   └── useCase/      # Application services
└── infrastructure/   # External integrations
    ├── repository/   # Data access
    └── cli/          # Command line tools
```

### Naming Conventions

- **Files**: PascalCase for classes (`ConfigManager.ts`)
- **Interfaces**: PascalCase with Interface suffix (`ModuleInterface.ts`)
- **Types**: PascalCase (`OperationResult.ts`)
- **Variables**: camelCase (`migrationContext`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_CONFIG`)

### Import/Export Patterns

```typescript
// Use path mapping
import { ModuleInterface } from "app/domain/interface/ModuleInterface.js";

// Group imports: external, then internal
import { PrismaClient } from "@prisma/client";
import { ConfigManager } from "app/domain/config/ConfigManager.js";

// Prefer named exports
export { ConfigManager };
export type { ModuleInterface };
```

## 🧪 Testing Guidelines

### Testing Philosophy

- **Unit Tests**: Domain and application logic
- **Integration Tests**: Infrastructure components
- **Path-Agnostic**: Use regex patterns for file path matching
- **Mock External Dependencies**: Database, file system, APIs

### Test Structure

```typescript
describe("ComponentName", () => {
  let component: ComponentName;
  let mockDependency: jest.Mocked<Dependency>;

  beforeEach(() => {
    mockDependency = createMockDependency();
    component = new ComponentName(mockDependency);
  });

  describe("methodName", () => {
    it("should handle successful case", () => {
      // Arrange
      const input = createTestInput();

      // Act
      const result = component.methodName(input);

      // Assert
      expect(result).toEqual(expectedOutput);
    });

    it("should handle error case", () => {
      // Test error scenarios
    });
  });
});
```

### Test Coverage

- Maintain high coverage for critical business logic
- Focus on edge cases and error conditions
- Use descriptive test names

## 📋 Commit Guidelines

Use **Conventional Commits** format:

```
<type>(<scope>): <description>

[optional body]
[optional footer(s)]
```

### Types

- **feat**: New feature for the user
- **fix**: Bug fix for the user
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **docs**: Documentation changes
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (deps, build, etc.)
- **perf**: Performance improvements

### Scopes

- **migration**: Migration system functionality
- **config**: Configuration management
- **module**: Module loading and management
- **repository**: Data access layer
- **cli**: Command line interfaces
- **workflow**: GitHub Actions workflows

### Examples

```bash
feat(migration): add rollback functionality for failed migrations
fix(config): resolve environment variable validation error
refactor(repository): implement repository pattern with dependency injection
docs(readme): update installation instructions
test(usecase): add unit tests for StartMigration use case
```

## 🔍 Pull Request Guidelines

### Before Submitting

- [ ] Code follows project conventions
- [ ] Tests are added for new features
- [ ] All tests pass locally
- [ ] Documentation is updated
- [ ] Commit messages follow conventional format
- [ ] No merge conflicts with main branch

### PR Description Template

```markdown
## Description

Brief description of the changes.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Screenshots (if applicable)

Add screenshots to help explain your changes.

## Related Issues

Closes #123
Related to #456
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Minimal steps to reproduce the behavior
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**:
   - Node.js version
   - Operating system
   - Package version
6. **Additional Context**: Screenshots, logs, etc.

## 💡 Feature Requests

When requesting features:

1. **Problem**: Describe the problem you're trying to solve
2. **Solution**: Describe the solution you'd like
3. **Alternatives**: Describe alternatives you've considered
4. **Use Case**: Provide specific use cases
5. **Implementation**: If you have ideas about implementation

## 🎯 Areas for Contribution

### High Priority

- [ ] Additional CLI features and options
- [ ] More comprehensive error handling
- [ ] Performance optimizations
- [ ] Integration with popular Discord libraries
- [ ] Documentation improvements

### Good First Issues

- [ ] Add more configuration validation rules
- [ ] Improve error messages
- [ ] Add more examples to documentation
- [ ] Enhance test coverage
- [ ] Fix typos and improve clarity

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Discord**: Join our Discord server for real-time help

## 🙏 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes for significant contributions
- GitHub contributors page

Thank you for contributing to Discord Bot Core! 🎉
