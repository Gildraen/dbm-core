# Discord Bot Core (@gildraen/dbm-core)<void>

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
import {
  RegisterListeners,
  DiscordListenerRepository,
} from "@gildraen/dbm-core";

export class BotApplication {
  private readonly client: Client;
  private readonly registerListeners: RegisterListeners;

  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });
    const listenerRepository = new DiscordListenerRepository(this.client);
    this.registerListeners = new RegisterListeners(listenerRepository);
  }

  async start(): Promise<void> {
    this.client.on("ready", async () => {
      console.log(`🤖 ${this.client.user?.tag} is ready!`);

      // Set up all module handlers
      const report = await this.registerListeners.execute();
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

Get the Discord client as the first parameter, with properly typed event arguments:

```typescript
@EventListener("ready")
export class ReadyHandler implements EventListener<"ready"> {
  async handle(client: Client): Promise<void> {
    console.log(`Bot ${client.user?.tag} is ready!`);
  }
}

@EventListener("messageCreate")
export class MessageHandler implements EventListener<"messageCreate"> {
  async handle(client: Client, message: Message): Promise<void> {
    // Both client and message are properly typed
    if (message.content === "!ping") {
      await message.reply("Pong!");
    }
  }
}

@EventListener("guildMemberAdd")
export class WelcomeHandler implements EventListener<"guildMemberAdd"> {
  async handle(client: Client, member: GuildMember): Promise<void> {
    // member is properly typed as GuildMember
    const channel = member.guild.systemChannel;
    if (channel) {
      await channel.send(`Welcome ${member.user.tag} to ${member.guild.name}!`);
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
import {
  StartMigration,
  RegisterCommands,
  RegisterListeners,
} from "@gildraen/dbm-core";
import { Client, GatewayIntentBits } from "discord.js";

// Create Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Programmatic usage
const migrationService = new StartMigration(repository);
const migrationReport = await migrationService.execute();

const commandService = new RegisterCommands(client);
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
