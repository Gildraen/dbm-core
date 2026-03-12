# Discord Bot Core (@gildraen/dbm-core)<void>

## 🎯 Features

- **Module Orchestration**: Coordinate independent module packages
- **CLI-First Deployment**: Separate command registration and runtime phases
- **TypeScript & Clean Architecture**: Domain-driven design with strict typing
- **Discord.js Integration**: Built-in support for Discord.js v14+

## 📦 Installation

```bash
yarn add @gildraen/dbm-core discord.js
```

> **Note**: Requires GitHub Package Registry setup. See [Publishing Guide](CONTRIBUTING.md#publishing) for `.npmrc` configuration.

## 🚀 Quick Start

Create a module package using the public decorator API:

```typescript
// @myorg/example-module/src/index.ts
import type { ModuleInterface } from "@gildraen/dbm-core";
import { SlashCommand, Event } from "@gildraen/dbm-core";

@SlashCommand("ping", "Replies with pong")
export class PingCommand {
  name = "PingCommand";

  async handle(interaction: any): Promise<void> {
    await interaction.reply("Pong!");
  }

  buildCommand() {
    return {
      type: "slash" as const,
      name: "ping",
      description: "Replies with pong",
    };
  }
}

@Event("ready")
export class ReadyHandler {
  name = "ReadyHandler";

  async handle(client: { id: string; name: string }): Promise<void> {
    console.log(`Bot ${client.name} (${client.id}) is ready`);
  }
}

export default {
  name: "example-module",
  async discoverCommands() {
    await import("./commands/PingCommand.js");
  },
  async discoverListeners() {
    await import("./listeners/ReadyHandler.js");
  },
} satisfies ModuleInterface;
```

**Deploy with CLI commands:**

```bash
yarn dbm-register-commands    # Register Discord commands
yarn start                    # Start the bot
```

## Complete Example Module

Want to see the complete workflow in action? Check out the workflow guide:

**[→ Workflow Overview](./docs/workflows/README.md)**

The workflow documentation demonstrates:

- ✅ Slash commands (`/ping`, `/greet`, `/math`)
- ✅ Event listeners (message logging, welcome messages)
- ✅ Autocomplete for command options
- ✅ Interactive components (role selector)
- ✅ Context menu commands (user info, message quote)
- ✅ Proper module structure with discovery functions

## CLI Usage

### Prerequisites

1. **Create configuration file**: Copy `.dbmrc.example.json` to `.dbmrc.json` and configure your modules
2. **Set Discord token**: Export your Discord bot token as an environment variable

```bash
# Copy example configuration
cp .dbmrc.example.json .dbmrc.json

# Edit configuration to enable your modules
# (See Configuration section below)

# Set your Discord bot token
export DISCORD_TOKEN="your-bot-token-here"
```

### Register Commands

The `register-commands` CLI automatically:

- Loads configuration from `.dbmrc.json`
- Initializes the registry system
- Discovers all enabled modules
- Registers slash commands with Discord API

```bash
# Register all commands from enabled modules
yarn dbm-register-commands

# Save registration report to file
yarn dbm-register-commands --output report.json

# Show help
yarn dbm-register-commands --help
```

**Important**: The registry is automatically initialized by the CLI. No manual setup required.

### Configuration

The `.dbmrc.json` file controls which modules are loaded:

```json
{
  "core": {
    "registry": {
      "type": "in-memory"
    }
  },
  "modules": {
    "@myorg/economy-module": {
      "enabled": true,
      "settings": {
        "dailyReward": 100,
        "currency": "coins"
      }
    },
    "@myorg/moderation-module": {
      "enabled": false,
      "settings": {}
    }
  }
}
```

**Configuration Structure:**

- `core.registry.type`: Registry implementation (`"in-memory"` or `"discord"`)
- `modules`: Object mapping module names to their configuration
- `modules[name].enabled`: Whether to load this module (`true`/`false`)
- `modules[name].settings`: Module-specific settings (varies per module)

## 🔧 Module Development

Create independent module packages that implement the `ModuleInterface`:

````typescript
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
      "balance",
      "Check your economy balance",
      new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Check your economy balance")
    );

    commandTool.addSlashCommand(
      "daily",
      "Claim your daily coins",
      new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Claim your daily coins")
    );

    return { commands: ["balance", "daily"] };
  }

## Handler Client Access

### Command Handlers
Access the Discord client via `interaction.client`:

```typescript
@SlashCommand
export class BalanceCommand implements SlashCommand {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const client = interaction.client;
    const botUser = client.user;

    await interaction.reply(`Balance checked by ${botUser?.tag}`);
  }
}
````

### Event Listeners

Event handlers receive platform-agnostic event arguments from `PlatformEvents`:

```typescript
@Event("ready")
export class ReadyHandler implements EventHandler {
  async handle(client: Client): Promise<void> {
    console.log(`Bot ${client.name} (${client.id}) is ready!`);
  }
}

@Event("messageCreate")
export class MessageHandler implements EventHandler {
  async handle(message: PlatformTextMessage): Promise<void> {
    if (message.content.content === "!ping") {
      await message.reply({ content: "Pong!" });
    }
  }
}

@Event("guildMemberAdd")
export class WelcomeHandler implements EventHandler {
  async handle(member: PlatformGuildMember): Promise<void> {
    const channel = member.guild.systemChannel;
    if (channel) {
      await channel.send({
        content: `Welcome ${member.user.tag} to ${member.guild.name}!`,
      });
    }
  }
}
```

}

export const economyModule = new EconomyModule();

````

**Configuration** (`.dbmrc.json`):

```json
{
  "economy": {
    "enabled": true,
    "settings": { "startingBalance": 1000 }
  }
}
````

## 📚 API Reference

### Core Types

```typescript
interface ModuleInterface {
  name: string;
  migrate?(context: { prisma: PrismaClient; dryRun: boolean }): Promise<void>;
  discoverCommands?(): Promise<void>;
  discoverListeners?(): Promise<void>;
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
import type { ModuleInterface } from "@gildraen/dbm-core";
import { SlashCommand, Event } from "@gildraen/dbm-core";

// Public API focuses on module authoring primitives
// (ModuleInterface and decorators).
```

## 🧪 Development

```bash
git clone https://github.com/Gildraen/discord-bot-modules-core.git
cd discord-bot-modules-core
yarn install
yarn build
yarn test
```

## 🤝 Contributing

We welcome community contributions! This project uses **merge commits** to preserve individual contributor recognition and maintain educational development history.

### Quick Contribution Guide

1. **Fork** and clone the repository
2. **Create a feature branch**: `git checkout -b feat/amazing-feature`
3. **Make atomic commits** with conventional commit messages
4. **Test thoroughly**: `yarn test && yarn lint:check && yarn build`
5. **Submit a pull request** using the provided template

### Why We Use Merge Commits

- 🏆 **Individual recognition**: Every contributor gets proper attribution
- 📚 **Learning opportunity**: Community can study development progression
- 🐛 **Better debugging**: Atomic commits help identify when issues were introduced
- 📊 **Contribution tracking**: Maintains accurate GitHub contribution graphs

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development guidelines, coding standards, and architectural principles.

### Areas We Need Help With

- 🚀 **CLI enhancements** and additional command options
- 📖 **Documentation improvements** and more examples
- 🧪 **Test coverage expansion** and edge case testing
- ⚡ **Performance optimizations** for large module ecosystems
- 🛠️ **Developer tooling** and debugging capabilities

## 📞 Community & Support

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions, ideas, and community help
- **Contributing**: See our detailed [Contributing Guide](CONTRIBUTING.md)

## License

MIT License - see [LICENSE](LICENSE) for details.
