---
applyTo: "**"
description: "General project guidelines and architecture principles"
---

# Project Overview

This project is a TypeScript library called **Discord Bot Core (@gildraen/dbm-core)** that provides a module management system for Discord bots using Clean Architecture principles.

## Architecture

The project follows Clean Architecture with three main layers:

- **Domain**: Core business logic and entities
- **Application**: Use cases and application services
- **Infrastructure**: External integrations (CLI, repository implementations)

## Libraries and Frameworks

- TypeScript 5.x with strict mode enabled
- Node.js 22 LTS runtime
- Vitest for testing framework
- ESLint for code linting
- GitHub Package Registry with @gildraen scope

## Development Principles

- Follow Clean Architecture dependency rules (Domain ← Application ← Infrastructure)
- Use dependency injection pattern
- Use path mapping: `app/*` maps to `src/*`
- Write comprehensive unit and integration tests
- Mock only external dependencies, test domain logic directly
