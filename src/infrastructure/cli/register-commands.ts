#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { Client, GatewayIntentBits } from "discord.js";

import { RegisterCommands } from "app/application/useCase/RegisterCommands.js";
import { DiscordCommandRepository } from "app/infrastructure/discord/repository/DiscordCommandRepository.js";
import { registryProvider } from "app/domain/registry/RegistryProvider.js";
import { createRegistry } from "app/infrastructure/registry/RegistryFactory.js";
import { config } from "app/domain/config/Config.js";

class RegisterDiscordCommandsCli {
    private readonly outputPath?: string;

    constructor() {
        const args = process.argv.slice(2);

        const outputIndex = args.findIndex(arg => arg === "--output" || arg === "-o");
        if (outputIndex !== -1 && args[outputIndex + 1]) {
            this.outputPath = path.resolve(process.cwd(), args[outputIndex + 1]);
        }

        if (args.includes("--help") || args.includes("-h")) {
            this.showHelp();
            process.exit(0);
        }
    }

    private showHelp() {
        console.log(`
Discord Bot Module Core - Command Registration

Usage: register-commands [options]

Options:
  -o, --output <file>   Save registration report to a file
  -h, --help           Show this help message

Environment Variables:
  DISCORD_TOKEN        Discord bot token (required)

Examples:
  register-commands --output report.json
  DISCORD_TOKEN=your_token register-commands
        `);
    }

    public async run() {
        console.log("🚀 Starting Discord command registration...");

        // Initialize registry before module discovery
        try {
            if (!registryProvider.isConfigured()) {
                console.log("📦 Initializing registry...");
                const coreConfig = config.getCoreConfig();
                const registryInstance = createRegistry(coreConfig.registry);
                registryProvider.configure(registryInstance);
                console.log("✅ Registry initialized");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("❌ Failed to initialize registry:", errorMessage);
            process.exit(1);
        }

        // Create Discord client for command registration
        const client = new Client({
            intents: [GatewayIntentBits.Guilds], // Minimal intents for command registration
        });

        const token = process.env.DISCORD_TOKEN;
        if (!token) {
            throw new Error("DISCORD_TOKEN environment variable is required for command registration");
        }
        await client.login(token);

        const commandRepository = new DiscordCommandRepository(client);

        try {
            const registry = registryProvider.getRegistry();
            const useCase = new RegisterCommands(commandRepository, registry);
            await useCase.execute();

            console.log("\n✅ Command registration completed");

            if (this.outputPath) {
                try {
                    const message = "Command registration completed successfully";
                    fs.writeFileSync(this.outputPath, JSON.stringify({ status: "success", message }, null, 2));
                    console.log(`📝 Status saved to: ${this.outputPath}`);
                } catch (err) {
                    console.error("❌ Failed to write registration report:", err);
                }
            }

            console.log("\n✅ Discord command registration completed successfully!");
        } finally {
            // Clean up Discord client connection
            if (client.isReady()) {
                client.destroy();
            }
        }
    }
}

new RegisterDiscordCommandsCli().run().catch((err: unknown) => {
    console.error('[COMMAND REGISTRATION FAILED]', err);
    process.exit(1);
});
