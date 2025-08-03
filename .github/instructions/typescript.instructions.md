---
applyTo: "src/**/*.ts"
description: "TypeScript coding standards and practices"
---

# TypeScript Coding Standards

## Type Safety

- Use TypeScript strict mode and maintain type safety
- Prefer explicit types over `any`
- Use proper generic constraints
- Implement proper error handling with Result types

## Code Organization

- Follow Clean Architecture layers (Domain, Application, Infrastructure)
- Use dependency injection with interfaces
- Implement repository pattern for data access
- Separate concerns with proper abstraction layers

## Import/Export Patterns

- Use path mapping (`app/*` → `src/*`)
- Prefer named exports over default exports
- Group imports: external libraries, then internal modules
- Use barrel exports for clean module interfaces
