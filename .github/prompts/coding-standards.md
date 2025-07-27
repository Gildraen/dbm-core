# Coding Standards & Guidelines

## 🎯 Architecture Principles

Follow **Clean Architecture** patterns:

- **Domain Layer**: Core business logic (entities, interfaces, types)
- **Application Layer**: Use cases and orchestration
- **Infrastructure Layer**: External concerns (database, CLI, API)

### Dependency Rules

- Dependencies flow inward (infrastructure → application → domain)
- Domain layer has no external dependencies
- Use dependency injection for testability

## 📝 TypeScript Standards

### Strict Configuration

```typescript
// Use strict TypeScript settings
"strict": true
"noImplicitAny": true
"strictNullChecks": true
```

### Type Definitions

- Always export interfaces and types
- Use descriptive names (`MigrationContext` not `Context`)
- Prefer interfaces over types for extensibility
- Use enums for fixed value sets

### Code Structure

```typescript
// Preferred file organization
export interface SomethingInterface {}
export type SomethingType = {};
export class SomethingClass implements SomethingInterface {}
export default SomethingClass;
```

## 🏗️ File Organization

### Directory Structure

```
src/
├── domain/           # Core business logic
│   ├── interface/    # Domain interfaces
│   ├── types/        # Domain types
│   └── model/        # Domain entities
├── application/      # Use cases
│   └── useCase/      # Application services
└── infrastructure/   # External integrations
    ├── repository/   # Data access
    └── cli/          # Command line tools
```

### Naming Conventions

- **Files**: PascalCase for classes (`ModuleLoader.ts`)
- **Interfaces**: PascalCase with Interface suffix (`ModuleInterface.ts`)
- **Types**: PascalCase (`OperationResult.ts`)
- **Variables**: camelCase (`migrationContext`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_CONFIG`)

## 🔧 Code Quality

### ESLint Rules

- Use the project's ESLint configuration
- Fix all linting errors before committing
- Prefer explicit types over `any`

### Error Handling

```typescript
// Use OperationResult pattern
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Import Organization

```typescript
// 1. Node modules
import { join } from "path";

// 2. Internal imports (absolute paths)
import { ModuleInterface } from "app/domain/interface/ModuleInterface";
import { ConfigManager } from "app/domain/config/ConfigManager";
```

## 📊 Performance Guidelines

- Use async/await for asynchronous operations
- Implement proper error boundaries
- Avoid blocking operations in main thread
- Use streaming for large data sets

## 🎨 Formatting

- **Indentation**: 2 spaces
- **Line Length**: 100 characters max
- **Semicolons**: Always use
- **Quotes**: Single quotes for strings
- **Trailing Commas**: Use in multiline structures

## 💡 Best Practices

### Documentation

- Add JSDoc comments for public APIs
- Include usage examples in complex functions
- Document architectural decisions in comments

### Security

- Validate all external inputs
- Use type-safe configuration loading
- Sanitize user-provided data

### Maintainability

- Keep functions small and focused
- Use descriptive variable names
- Prefer composition over inheritance
- Write self-documenting code
