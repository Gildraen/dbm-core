---
applyTo: "tests/**/*.test.ts"
description: "Testing guidelines and best practices"
---

# Testing Guidelines

## Testing Philosophy

Follow the testing pyramid: Many unit tests, some integration tests, few E2E tests.

Core principles:

- **Fast**: Tests should run quickly
- **Independent**: Tests don't depend on each other
- **Repeatable**: Same results every time
- **Self-Validating**: Clear pass/fail results

## Test Structure

- Unit tests for domain and application logic
- Integration tests for infrastructure components
- Mirror the src structure in tests directory
- Use path mapping: `app/*` → `src/*` in imports

## Testing Practices

- Mock only external dependencies, test domain logic directly
- Use descriptive test names that explain the scenario
- Follow Arrange-Act-Assert pattern
- Maintain high test coverage for critical business logic
- Use test doubles appropriately (mocks, stubs, fakes)
- Ensure tests are deterministic and isolated

## Vitest Framework

- Use Vitest as the testing framework with globals enabled
- Configure Node.js environment for backend testing
- Use setup files for common test configuration
- Leverage Vitest's built-in mocking capabilities

## Test Execution

🚨 **ALWAYS use `yarn` for test commands**:

- ✅ `yarn test` - Run all tests
- ✅ `yarn test:watch` - Run tests in watch mode
- ✅ `yarn build && yarn test` - Build and test
- ❌ Never use `npm test`, `npm run test`, etc.
