# Project Context & Requirements

## 🎯 Project Overview

**Discord Bot Core (@gildraen/dbm-core)** is a TypeScript library for building Discord bot migration and module management systems using Clean Architecture principles.

### Core Purpose

- Provide structured migration system for Discord bots
- Enable modular bot architecture
- Support configuration management
- Facilitate bot command registration

## 🏗️ Architecture Context

### Clean Architecture Implementation

```
┌─────────────────────────────────────┐
│           Infrastructure            │ ← External concerns
├─────────────────────────────────────┤
│             Application             │ ← Use cases & orchestration
├─────────────────────────────────────┤
│               Domain                │ ← Core business logic
└─────────────────────────────────────┘
```

**Domain Layer** (No dependencies):

- `interface/` - Core abstractions
- `types/` - Business value objects
- `model/` - Domain entities
- `config/` - Configuration schemas

**Application Layer** (Depends on Domain):

- `useCase/` - Business workflows
- Orchestrates domain services
- Handles cross-cutting concerns

**Infrastructure Layer** (Depends on Domain & Application):

- `repository/` - Data persistence
- `cli/` - Command line interfaces
- External API integrations

## 📦 Package Configuration

### Registry & Publishing

- **Registry**: GitHub Package Registry
- **Scope**: `@gildraen` (must match GitHub username)
- **Package Name**: `@gildraen/dbm-core`
- **Prefix Strategy**: All modules prefixed with "dbm"

### Authentication

```bash
# GitHub Package Registry setup
npm config set @gildraen:registry=https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

## 🔧 Technical Stack

### Core Dependencies

- **TypeScript 5.x**: Strict mode with ES2022 target
- **Node.js 22**: LTS version for latest features
- **Yarn**: Package manager
- **Vitest**: Testing framework
- **ESLint**: Code quality and consistency

### Development Tools

- **GitHub Actions**: CI/CD pipeline
- **Conventional Commits**: Commit message format
- **Path Mapping**: `app/*` alias for `src/*`

## 🚀 Build & Deploy Pipeline

### Workflow Structure

1. **CI Workflow** (`ci.yml`): Tests and linting on all PRs
2. **Beta Workflow** (`beta.yml`): Publishes beta versions on PR merge
3. **Manual Release** (`manual-release.yml`): Triggered releases
4. **Release Workflow** (`release.yml`): Production releases

### Version Strategy

- **Beta**: `1.0.0-beta.{timestamp}` on PR merges
- **Release**: Semantic versioning on manual triggers
- **No Auto-Release**: Main branch doesn't auto-publish

## 🧪 Testing Strategy

### Framework: Vitest

```typescript
// Mock-based testing approach
vi.mock("app/infrastructure/repository/PrismaMigrationRepository");
```

### Testing Principles

- **Unit Tests**: Domain and application logic
- **Integration Tests**: Infrastructure components
- **Path-Agnostic**: Use regex patterns for file path matching
- **Mock External Dependencies**: Database, file system, APIs

### Test Organization

```
tests/
├── domain/          # Domain logic tests
├── application/     # Use case tests
└── infrastructure/  # External integration tests
```

## 📂 Module Structure

### Typical Module Pattern

```typescript
// Domain Interface
export interface SomethingRepository {
  find(id: string): Promise<Something>;
  save(entity: Something): Promise<void>;
}

// Infrastructure Implementation
export class PrismaSomethingRepository implements SomethingRepository {
  // Concrete implementation
}

// Application Use Case
export class SomethingUseCase {
  constructor(private repository: SomethingRepository) {}
  // Business workflow
}
```

## 🎯 Domain Concepts

### Core Entities

- **Migration**: Database/bot state changes
- **Module**: Pluggable bot functionality
- **Config**: Environment and bot settings
- **Operation**: Result wrapper for error handling

### Key Interfaces

- `MigrationRepository`: Data persistence abstraction
- `ModuleInterface`: Plugin architecture
- `ConfigManager`: Configuration loading

## 🔄 Migration System

### Migration Context

```typescript
interface MigrationContext {
  id: string;
  name: string;
  description: string;
  timestamp: Date;
  dependencies: string[];
}
```

### Operation Result Pattern

```typescript
interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## 📚 Configuration Management

### Config Schema

- Environment-based configuration
- Type-safe schema validation
- Default value handling
- Validation error reporting

### Supported Environments

- Development
- Testing
- Production
- Custom environments

## 🎮 Discord Integration

### Command Registration

- Automatic command discovery
- Slash command support
- Permission validation
- Error handling and reporting

### Bot Module System

- Hot-swappable modules
- Dependency injection
- Configuration per module
- Lifecycle management

## 📋 Development Guidelines

### Adding New Features

1. Start with domain interface
2. Create application use case
3. Implement infrastructure
4. Add comprehensive tests
5. Update documentation

### Breaking Changes

- Update major version
- Provide migration guide
- Update examples and docs
- Communicate changes clearly

### Performance Considerations

- Async/await for I/O operations
- Streaming for large datasets
- Connection pooling for databases
- Caching where appropriate
