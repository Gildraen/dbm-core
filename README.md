# Discord Bot Core (@gildraen/dbm-core)

A TypeScript library for orchestrating Discord bot modules using Clean Architecture principles. Modules are independent npm packages that manage their own database schemas, migrations, and Discord commands.

## 🎯 Features

- **Module Orchestration**: Coordinates independent module packages
- **Migration Management**: Orchestrates module database migrations
- **Command Registration**: Coordinates Discord command registration across modules
- **Handler Setup**: Coordinates Discord event handler setup across modules
- **Configuration Management**: Type-safe configuration with schema validation
- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **CLI Tools**: Built-in command-line utilities for module coordination

## 📦 Installation

```bash
# From GitHub Package Registry
yarn add @gildraen/dbm-core
```

### GitHub Package Registry Setup

Create a `.npmrc` file in your project root:

```
@gildraen:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

## 🚀 Quick Start

### 1. Install Core Library

```bash
yarn add @gildraen/dbm-core
```

### 2. Install Module Packages

```bash
# Install independent module packages
yarn add @myorg/discord-economy-module
yarn add @myorg/discord-levels-module
```

### 3. Create Configuration

Create `.dbmrc.json` in your project root:

```json
{
  "economy": {
    "enabled": true,
    "settings": {
      "startingBalance": 1000,
      "dailyReward": 100
    }
  },
  "levels": {
    "enabled": true,
    "settings": {
      "xpMultiplier": 1.5
    }
  }
}
```

### 4. Deploy with CLI Commands

```bash
# 1. Run module migrations (typically in init container)
yarn dbm-migrate

# 2. Register Discord commands (typically in init container)
yarn dbm-register-commands

# 3. Start your main Discord bot
yarn start
```

### 5. Main Bot Integration

```typescript
// bot/src/index.ts - Your main bot file
import { Client } from 'discord.js';
import { SetupModuleHandlers } from '@gildraen/dbm-core';
import { economyModule } from '@myorg/discord-economy-module';
import { levelsModule } from '@myorg/discord-levels-module';

const client = new Client({ intents: [...] });

client.on('ready', async () => {
  console.log(`Bot logged in as ${client.user?.tag}`);

  // Set up module event handlers using the core use case
  const setupHandlers = new SetupModuleHandlers(client);
  const report = await setupHandlers.execute();

  // Log setup results
  console.log(`Handler setup: ${report.successCount} success, ${report.failureCount} failed`);
  report.results.forEach(result => {
    if (result.status === 'success') {
      console.log(`✅ Handlers set up for ${result.moduleName}`);
    } else {
      console.error(`❌ Failed to set up handlers for ${result.moduleName}: ${result.error}`);
    }
  });
});

client.on('guildMemberAdd', async (member) => {
  // Handle general events that aren't module-specific
  console.log(`${member.user.tag} joined the server`);
});

client.login(process.env.DISCORD_TOKEN);
```

## 🏗️ Architecture

This library provides **CLI-based orchestration** for independent module packages. The deployment follows a **multi-container pattern** where setup and runtime are separated.

### **Deployment Flow**

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Migration         │    │   Command           │    │   Main Bot          │
│   Container         │    │   Registration      │    │   Container         │
│   (Init)           │    │   Container (Init)  │    │   (Long-running)    │
├─────────────────────┤    ├─────────────────────┤    ├─────────────────────┤
│ yarn dbm-migrate    │ →  │ yarn dbm-register-  │ →  │ yarn start          │
│ (exits after done) │    │ commands            │    │ (Discord bot logic) │
│                     │    │ (exits after done) │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

### **Core Responsibilities**

- ✅ **CLI Tools**: Provides `dbm-migrate` and `dbm-register-commands` commands
- ✅ **Module Orchestration**: Coordinates module loading and execution
- ✅ **Configuration Management**: Handles `.dbmrc.json` configuration
- ✅ **Error Handling**: Provides consistent error handling and reporting

### **Module Responsibilities**

- ✅ **Database Schema**: Each module manages its own Prisma schema
- ✅ **Migration Logic**: Modules handle their own database migrations
- ✅ **Discord Commands**: Modules register their own slash commands
- ✅ **Business Logic**: All module-specific functionality and services

```
┌─────────────────────────────────────┐
│           Infrastructure            │ ← CLI, Repository implementations
├─────────────────────────────────────┤
│             Application             │ ← Use cases, orchestration
├─────────────────────────────────────┤
│               Domain                │ ← Core business logic, interfaces
└─────────────────────────────────────┘

    ┌─────────────────┐    ┌─────────────────┐
    │   Economy       │    │   Levels        │
    │   Module        │    │   Module        │
    │   Package       │    │   Package       │
    └─────────────────┘    └─────────────────┘
```

### Directory Structure

```
src/
├── domain/           # Core business logic
│   ├── interface/    # Domain interfaces
│   ├── types/        # Domain types
│   ├── config/       # Configuration management
│   └── service/      # Domain services
├── application/      # Use cases
│   └── useCase/      # Application services
└── infrastructure/   # External integrations
    ├── repository/   # Data persistence
    └── cli/          # Command line tools
```

## 📚 API Reference

### CLI Commands

```bash
# Migration command - runs all enabled module migrations
yarn dbm-migrate [--dry-run]

# Command registration - registers all module commands with Discord
yarn dbm-register-commands [--dry-run]
```

### Use Cases (Programmatic API)

```typescript
import {
  StartMigration,
  RegisterDiscordCommands,
  SetupModuleHandlers,
  type ModuleInterface,
} from "@gildraen/dbm-core";

// Run module migrations programmatically
const startMigration = new StartMigration(migrationRepository);
const results = await startMigration.execute();

// Register Discord commands programmatically
const registerCommands = new RegisterDiscordCommands(false); // false = not dry run
const results = await registerCommands.execute();

// Set up Discord event handlers for modules
const setupHandlers = new SetupModuleHandlers(discordClient);
const report = await setupHandlers.execute();
```

### Module Development Interface

```typescript
interface ModuleInterface {
  name: string;
  version?: string;
  migrate(context: MigrationContext): Promise<void>;
  register?(context: RegisterContext): Promise<void>;
  setupHandlers?(client: Client): void; // Called during bot startup
}
```

### MigrationContext

```typescript
type MigrationContext = {
  prisma: PrismaClient; // Prisma client for database access
  dryRun: boolean; // Whether this is a dry run
};
```

### RegisterContext

```typescript
type RegisterContext = {
  dryRun: boolean; // Whether this is a dry run
};
```

### Module Integration Interface

```typescript
interface ModuleInterface {
  name: string;
  version?: string;
  migrate(context: MigrationContext): Promise<void>;
  register?(context: RegisterContext): Promise<void>;
  setupHandlers?(client: Client): void; // Called during bot startup to set up Discord event handlers
}
```

### OperationReport

```typescript
type OperationReport = {
  results: OperationResult[];
  totalDurationMs: number;
  successCount: number;
  failureCount: number;
};
```

## 🧪 Development

### Prerequisites

- Node.js 22+ LTS
- Yarn package manager
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/Gildraen/discord-bot-modules-core.git
cd discord-bot-modules-core

# Install dependencies
yarn install

# Build the project
yarn build

# Run tests
yarn test

# Run linting
yarn lint:check
```

### Available Scripts

- `yarn build` - Compile TypeScript to JavaScript
- `yarn test` - Run test suite
- `yarn test:watch` - Run tests in watch mode
- `yarn lint:check` - Check code quality
- `yarn lint` - Fix linting issues
- `yarn clean` - Remove build artifacts

## 🔧 Module Development

### Creating a Module Package

Modules are independent npm packages. See the [Advanced Economy Example](examples/advanced-economy/README.md) for a complete implementation.

**Basic structure:**

```
@myorg/discord-economy-module/
├── prisma/
│   ├── schema.prisma      # Module's database schema
│   └── migrations/        # Prisma migration files
├── src/
│   ├── index.ts          # ModuleInterface implementation
│   ├── migrations.ts     # Data seeding and custom migrations
│   └── commands/         # Discord slash commands
├── package.json          # Module package configuration
└── README.md            # Module documentation
```

**Module implementation:**

```typescript
// src/index.ts
import type { ModuleInterface } from "@gildraen/dbm-core";
import { SlashCommandBuilder, REST, Routes } from "discord.js";
import { EconomyService } from "./services/EconomyService.js";

export const economyModule: ModuleInterface = {
  name: "economy",
  version: "2.1.0",

  async migrate({ prisma, dryRun }) {
    console.log("🏦 Running economy module migrations");

    if (dryRun) {
      console.log("  📋 DRY RUN: Would run economy migrations");
      return;
    }

    // Module handles its own migrations
    await runEconomyMigrations();
  },

  async register({ dryRun }) {
    console.log("💰 Registering economy commands");

    if (dryRun) {
      console.log("  📋 DRY RUN: Would register /balance, /daily commands");
      return;
    }

    // Register slash commands with Discord API (no client needed)
    const commands = [
      new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check your balance"),
      new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Claim your daily reward"),
    ];

    const rest = new REST().setToken(process.env.DISCORD_TOKEN!);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
      body: commands,
    });
  },

  // Called when main bot starts and provides client
  setupHandlers(client) {
    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const economyService = new EconomyService();

      switch (interaction.commandName) {
        case "balance":
          const balance = await economyService.getUserBalance(
            interaction.user.id
          );
          await interaction.reply(`Your balance: ${balance} coins`);
          break;

        case "daily":
          const reward = await economyService.claimDaily(interaction.user.id);
          if (reward) {
            await interaction.reply(
              `Daily reward claimed: ${reward.amount} coins! Streak: ${reward.streak}`
            );
          } else {
            await interaction.reply(
              "You already claimed your daily reward today!"
            );
          }
          break;
      }
    });
  },
};
```

### Configuration Schema

Each module in `.dbmrc.json` follows this structure:

```typescript
{
  "module-name": {
    "enabled": boolean,      // Whether the module is active
    "settings": {            // Module-specific settings
      // Any key-value pairs your module needs
    }
  }
}
```

### Database Setup

Each module manages its own database schema using Prisma:

```bash
# In your module package
yarn prisma migrate dev --name init
yarn prisma generate
```

The core library provides a shared Prisma client instance to all modules for coordination.

### Environment Variables

The library respects standard Node.js environment patterns:

- `NODE_ENV` - Environment (development, production, test)
- `DATABASE_URL` - Prisma database connection string

## 📖 Examples

### Basic Module Implementation

```typescript
import type { ModuleInterface, MigrationContext } from "@gildraen/dbm-core";

export const userModule: ModuleInterface = {
  name: "user-management",
  version: "1.0.0",

  async migrate({ prisma, dryRun }: MigrationContext) {
    if (dryRun) {
      console.log("Would initialize user management system");
      return;
    }

    // Check if users exist, seed data if needed
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log("User management system ready for new users");
    }
  },
};
```

### Command Registration Module

```typescript
import type { ModuleInterface, RegisterContext } from "@gildraen/dbm-core";

export const helpModule: ModuleInterface = {
  name: "help-commands",
  version: "1.2.0",

  async migrate() {
    // No database changes needed
    console.log("Help system ready");
  },

  async register({ dryRun }: RegisterContext) {
    if (dryRun) {
      console.log("Would register /help, /about commands");
      return;
    }

    // Register Discord slash commands
    await registerHelpCommands();
    console.log("Help commands registered successfully");
  },
};
```

### Integration Example

```typescript
// bot/src/index.ts - Main bot file
import { Client } from 'discord.js';

const client = new Client({ intents: [...] });

// Main bot only handles general Discord events
// Modules register their own command handlers during the register() phase
client.on('ready', () => {
  console.log(`Bot logged in as ${client.user?.tag}`);
});

client.on('guildMemberAdd', async (member) => {
  // Handle general events that aren't module-specific
  console.log(`${member.user.tag} joined the server`);
});

// No need to handle interactions - modules registered their own handlers!
client.login(process.env.DISCORD_TOKEN);
```

### Docker Deployment Example

```dockerfile
# Dockerfile.migration
FROM node:22-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
CMD ["yarn", "dbm-migrate"]

# Dockerfile.commands
FROM node:22-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
CMD ["yarn", "dbm-register-commands"]

# Dockerfile.bot
FROM node:22-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
CMD ["yarn", "start"]
```

```yaml
# docker-compose.yml
version: "3.8"
services:
  migration:
    build:
      dockerfile: Dockerfile.migration
    environment:
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres

  commands:
    build:
      dockerfile: Dockerfile.commands
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DISCORD_TOKEN=${DISCORD_TOKEN}
    depends_on:
      - migration

  bot:
    build:
      dockerfile: Dockerfile.bot
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DISCORD_TOKEN=${DISCORD_TOKEN}
    depends_on:
      - commands
    restart: always
```

```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Ensure all tests pass: `yarn test`
6. Commit using conventional commits: `git commit -m "feat: add amazing feature"`
7. Push to your branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Coding Standards

- Follow Clean Architecture principles
- Use TypeScript strict mode
- Write comprehensive tests
- Use conventional commit messages
- Maintain high code coverage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/Gildraen/discord-bot-modules-core)
- [Issues](https://github.com/Gildraen/discord-bot-modules-core/issues)
- [GitHub Package Registry](https://github.com/Gildraen/discord-bot-modules-core/packages)

## 🙏 Acknowledgments

- Built with TypeScript and Clean Architecture principles
- Uses Prisma for database management
- Tested with Vitest framework
- Published to GitHub Package Registry
```
