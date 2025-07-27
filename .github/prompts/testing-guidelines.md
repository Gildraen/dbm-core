# Testing Guidelines & Standards

## 🎯 Testing Philosophy

### Testing Pyramid

```
    /\     E2E Tests (Few)
   /  \
  /____\   Integration Tests (Some)
 /      \
/__________\ Unit Tests (Many)
```

### Core Principles

- **Fast**: Tests should run quickly
- **Independent**: Tests don't depend on each other
- **Repeatable**: Same results every time
- **Self-Validating**: Clear pass/fail results
- **Timely**: Written just before or with production code

## 🧪 Testing Framework: Vitest

### Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      app: path.resolve(__dirname, "./src"),
    },
  },
});
```

### Import Strategy

```typescript
// Use path mapping for consistency
import { StartMigration } from "app/application/useCase/StartMigration";
import { ConfigManager } from "app/domain/config/ConfigManager";
```

## 🏗️ Test Structure & Organization

### Directory Structure

```
tests/
├── domain/              # Domain logic tests
│   ├── config/         # Configuration tests
│   └── types/          # Type validation tests
├── application/        # Use case tests
│   └── useCase/        # Application service tests
└── infrastructure/     # External integration tests
    ├── repository/     # Data access tests
    └── cli/           # Command line tests
```

### File Naming

- Test files: `*.test.ts`
- Match source structure: `src/domain/config/ConfigManager.ts` → `tests/domain/config/ConfigManager.test.ts`

## 🎭 Mocking Strategy

### Mock External Dependencies

```typescript
// Mock infrastructure dependencies
vi.mock("app/infrastructure/repository/PrismaMigrationRepository", () => ({
  PrismaMigrationRepository: vi.fn().mockImplementation(() => ({
    findAll: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  })),
}));
```

### Mock Principles

- **Mock at boundaries**: Infrastructure layer
- **Don't mock domain logic**: Test real business logic
- **Mock what you don't own**: External libraries, file system, databases

### Common Mock Patterns

```typescript
// Repository mocking
const mockRepository = {
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
} as jest.Mocked<MigrationRepository>;

// File system mocking
vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  access: vi.fn(),
}));

// Configuration mocking
vi.mock("app/domain/config/ConfigManager", () => ({
  ConfigManager: {
    load: vi.fn().mockResolvedValue(mockConfig),
  },
}));
```

## ✅ Test Patterns

### Unit Test Structure

```typescript
describe("StartMigration", () => {
  let useCase: StartMigration;
  let mockRepository: jest.Mocked<MigrationRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    useCase = new StartMigration(mockRepository);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully start migration when conditions are met", async () => {
      // Arrange
      const migrationContext = createMockMigrationContext();
      mockRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(migrationContext);

      // Assert
      expect(result.success).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(migrationContext);
    });

    it("should fail when migration already exists", async () => {
      // Arrange
      const existingMigration = createMockMigration();
      mockRepository.findAll.mockResolvedValue([existingMigration]);

      // Act
      const result = await useCase.execute(existingMigration);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/already exists/);
    });
  });
});
```

### Integration Test Structure

```typescript
describe("PrismaMigrationRepository", () => {
  let repository: PrismaMigrationRepository;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: { db: { url: TEST_DATABASE_URL } },
    });
    repository = new PrismaMigrationRepository(prisma);
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should save and retrieve migrations", async () => {
    // Test with real database
  });
});
```

## 🔍 Path-Agnostic Testing

### Problem: Platform-specific paths fail in CI

```typescript
// ❌ Fails on different platforms
expect(error.message).toBe("Config file not found at /unix/path/config.yml");

// ✅ Platform agnostic
expect(error.message).toMatch(/Config file not found at .+config\.yml/);
```

### Regex Patterns for Paths

```typescript
// File path matching
expect(result.filePath).toMatch(/config\.yml$/);
expect(error.message).toMatch(/\/migrations\/\d+_.+\.sql/);

// Directory matching
expect(modulePath).toMatch(/modules[\/\\]discord[\/\\]commands/);

// Extension matching
expect(files).toEqual(expect.arrayContaining([expect.stringMatching(/\.ts$/)]));
```

## 📊 Test Coverage

### Coverage Goals

- **Unit Tests**: > 90% for domain and application layers
- **Integration Tests**: > 80% for infrastructure layer
- **Overall**: > 85% total coverage

### Coverage Commands

```bash
# Generate coverage report
yarn test --coverage

# View HTML report
yarn test --coverage --reporter=html
```

### Coverage Exclusions

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      exclude: ["tests/**", "**/*.d.ts", "**/index.ts"],
    },
  },
});
```

## 🧩 Test Utilities

### Mock Factories

```typescript
// tests/factories/MigrationFactory.ts
export const createMockMigration = (
  overrides?: Partial<Migration>
): Migration => ({
  id: "001",
  name: "test_migration",
  description: "Test migration",
  timestamp: new Date(),
  dependencies: [],
  ...overrides,
});

export const createMockRepository = (): jest.Mocked<MigrationRepository> => ({
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
  findById: vi.fn(),
});
```

### Test Helpers

```typescript
// tests/helpers/DatabaseHelper.ts
export const cleanDatabase = async () => {
  // Clean test database
};

export const seedTestData = async () => {
  // Seed with test data
};
```

## 🚀 Performance Testing

### Test Performance Guidelines

- Unit tests: < 50ms each
- Integration tests: < 500ms each
- Total test suite: < 30 seconds

### Async Testing

```typescript
// Use proper async/await
it("should handle async operations", async () => {
  const result = await someAsyncFunction();
  expect(result).toBeDefined();
});

// Timeout for slow operations
it("should handle slow operations", async () => {
  // Test implementation
}, 10000); // 10 second timeout
```

## 🎯 Testing Best Practices

### Naming Tests

```typescript
// ✅ Good: Descriptive test names
it("should return error when migration file is missing");
it("should load configuration from environment variables");
it("should register commands with Discord API successfully");

// ❌ Avoid: Vague test names
it("should work");
it("should test the function");
it("should be correct");
```

### Arrange-Act-Assert Pattern

```typescript
it("should validate configuration successfully", () => {
  // Arrange: Set up test data
  const config = { botToken: "test-token", guildId: "12345" };
  const validator = new ConfigValidator();

  // Act: Execute the operation
  const result = validator.validate(config);

  // Assert: Verify the outcome
  expect(result.isValid).toBe(true);
  expect(result.errors).toHaveLength(0);
});
```

### Error Testing

```typescript
it("should throw descriptive error for invalid config", () => {
  const invalidConfig = { botToken: "" };

  expect(() => {
    new ConfigManager(invalidConfig);
  }).toThrow("Bot token is required");
});

// For async errors
it("should reject with error for network failure", async () => {
  mockHttpClient.get.mockRejectedValue(new Error("Network error"));

  await expect(service.fetchData()).rejects.toThrow("Network error");
});
```

## 🔧 Debugging Tests

### Debug Configuration

```typescript
// Use debugger in tests
it("should debug complex logic", () => {
  debugger; // Breakpoint here
  const result = complexFunction();
  expect(result).toBeDefined();
});
```

### Logging in Tests

```typescript
// Temporary logging for debugging
it("should log intermediate values", () => {
  const input = createTestInput();
  console.log("Input:", input); // Remove before commit

  const result = processInput(input);
  console.log("Result:", result); // Remove before commit

  expect(result).toEqual(expectedOutput);
});
```

## ✨ Quality Checklist

Before committing tests:

- [ ] All tests pass locally
- [ ] Tests are deterministic (same result every run)
- [ ] No hardcoded paths or platform-specific code
- [ ] Meaningful test names and descriptions
- [ ] Proper mocking of external dependencies
- [ ] Tests follow AAA pattern
- [ ] Coverage meets project standards
- [ ] No debugging code left in tests
