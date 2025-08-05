# Discord Bot Core (@gildraen/dbm-core)

A TypeScript library for orchestrating Discord bot modules using Clean Architecture principles. Build modular Discord bots where each feature is an independent npm package.

## 🎯 Features

- **Module Orchestration**: Coordinate independent module packages
- **CLI-First Deployment**: Separate migration, command registration, and runtime phases
- **TypeScript & Clean Architecture**: Domain-driven design with strict typing
- **Discord.js Integration**: Built-in support for Discord.js v14+

## 📦 Installation

```bash
yarn add @gildraen/dbm-core discord.js
```

> **Note**: Requires GitHub Package Registry setup. See [Publishing Guide](CONTRIBUTING.md#publishing) for `.npmrc` configuration.

## 🚀 Quick Start

Create a Discord bot with modular architecture:

```typescript
// bot/src/BotApplication.ts
import { Client, GatewayIntentBits } from "discord.js";
import { SetupModuleHandlers } from "@gildraen/dbm-core";

export class BotApplication {
  private readonly client: Client;
  private readonly setupHandlers: SetupModuleHandlers;

  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });
    this.setupHandlers = new SetupModuleHandlers(this.client);
  }

  async start(): Promise<void> {
    this.client.on("ready", async () => {
      console.log(`🤖 ${this.client.user?.tag} is ready!`);

      // Set up all module handlers
      const report = await this.setupHandlers.execute();
      console.log(`✅ ${report.successCount} modules loaded`);
    });

    await this.client.login(process.env.DISCORD_TOKEN);
  }
}
```

**Deploy with CLI commands:**

```bash
yarn dbm-migrate              # Run database migrations
yarn dbm-register-commands    # Register Discord commands
yarn start                    # Start the bot
```

## 🔧 Module Development

Create independent module packages that implement the `ModuleInterface`:

```typescript
// @myorg/economy-module/src/index.ts
import type { ModuleInterface } from "@gildraen/dbm-core";
import { Client } from "discord.js";

export class EconomyModule implements ModuleInterface {
  name = "economy";

  // Optional: Handle database migrations
  async migrate({ prisma, dryRun }) {
    if (!dryRun) {
      await prisma.user.createMany({
        data: [
          /* seed data */
        ],
        skipDuplicates: true,
      });
    }
  }

  // Optional: Register Discord slash commands
  async register({ commandTool }) {
    // ✅ NEW: Use CommandRegistrationTool for safe command declaration
    commandTool.addSlashCommand(
      'balance',
      'Check your economy balance',
      new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your economy balance')
    );
    
    commandTool.addSlashCommand(
      'daily',
      'Claim your daily coins',
      new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily coins')
    );
    
    return { commands: ['balance', 'daily'] };
  }

  // Optional: Set up Discord event handlers
  setupHandlers(client: Client) {
    client.on("interactionCreate", async (interaction) => {
      if (interaction.commandName === "balance") {
        // Handle balance command
      }
    });
  }
}

export const economyModule = new EconomyModule();
```

**Configuration** (`.dbmrc.json`):

```json
{
  "economy": {
    "enabled": true,
    "settings": { "startingBalance": 1000 }
  }
}
```

## 📚 API Reference

### Core Types

```typescript
interface ModuleInterface {
  name: string;
  migrate?(context: { prisma: PrismaClient; dryRun: boolean }): Promise<void>;
  register?(context: { commandTool: CommandRegistrationTool }): Promise<void>;
  setupHandlers?(client: Client): void;
}

type OperationReport = {
  results: OperationResult[];
  totalDurationMs: number;
  successCount: number;
  failureCount: number;
};
```

### Use Cases

```typescript
import {
  StartMigration,
  RegisterDiscordCommands,
  SetupModuleHandlers,
} from "@gildraen/dbm-core";
import { Client, GatewayIntentBits } from "discord.js";

// Create Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Programmatic usage
const migrationService = new StartMigration(repository);
const migrationReport = await migrationService.execute();

const commandService = new RegisterDiscordCommands(client);
const commandReport = await commandService.execute();
```

## 🧪 Development

```bash
git clone https://github.com/Gildraen/discord-bot-modules-core.git
cd discord-bot-modules-core
yarn install
yarn build
yarn test
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.
