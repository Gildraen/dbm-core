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

## File and Folder Organization

### Types vs Interfaces

**Use `type` for:**

- Data structures and shapes (metadata, configurations, DTOs)
- Union types and mapped types
- Type aliases and computed types
- Located in: `src/domain/types/` or `src/application/types/`

**Use `interface` for:**

- Contracts and behaviors (services, repositories, handlers)
- Extensible APIs and plugin systems
- Class implementations and dependency injection
- Located in: `src/domain/interface/` or `src/application/interface/`

### Folder Structure Rules

```
src/
├── domain/
│   ├── interface/          # Behavioral contracts (interfaces)
│   │   ├── decorators/     # Handler interfaces
│   │   ├── repository/     # Repository contracts
│   │   └── service/        # Service contracts
│   ├── types/              # Data structures (types)
│   │   ├── metadata/       # Handler metadata types
│   │   ├── platform/       # Platform abstraction types
│   │   └── ...             # Other data types
│   └── ...
```

## Import/Export Patterns

- Use path mapping (`app/*` → `src/*`)
- Prefer named exports over default exports
- Group imports: external libraries, then internal modules
- **Use direct file imports** for all internal code (no barrel exports)

### File Import Strategy

**Internal Code (Performance-Optimized):**

```typescript
// ✅ Direct imports only - no barrel exports
import { SlashCommandHandler } from "app/domain/interface/handlers/commands/SlashCommandHandler.js";
import { CommandMetadata } from "app/domain/types/metadata/CommandMetadata.js";
```

**Public API (Single Barrel Export):**

- Only `src/index.ts` uses barrel exports for external consumers
- All internal code must use direct file paths for optimal build performance
- Reduces module graph complexity and improves tree-shaking

### Public API Organization (src/index.ts only)

When updating the public API barrel export:

```typescript
// 1. Import all exports with direct file paths
import { ModuleInterface } from "app/domain/interface/ModuleInterface.js";
import { SlashCommand } from "app/domain/decorators/SlashCommand.js";
import { Event } from "app/domain/decorators/Event.js";

// 2. Re-export for external consumers
export { ModuleInterface };
export { SlashCommand };
export { Event };

// 3. Keep exports minimal - only what module developers truly need
```
