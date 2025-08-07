#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { Client, GatewayIntentBits } from "discord.js";

import { RegisterDiscordCommands } from "app/application/useCase/RegisterDiscordCommands.js";
import { DiscordCommandRepository } from "app/infrastructure/repository/DiscordCommandRepository.js";

class RegisterDiscordCommandsCli {
    private readonly dryRun: boolean;
    private readonly outputPath?: string;

    constructor() {
        const args = process.argv.slice(2);
        this.dryRun = args.includes("--dry-run");

        const outputIndex = args.findIndex(arg => arg === "--output");
        if (outputIndex !== -1 && args.length > outputIndex + 1) {
            this.outputPath = path.resolve(process.cwd(), args[outputIndex + 1]);
        }
    }

    public async run() {
        console.log("🤖 Registering Discord application commands...");

        if (this.dryRun) {
            console.log("🔍 Running in dry-run mode (no actual registration)");
        }

        // Create Discord client for command registration
        const client = new Client({
            intents: [GatewayIntentBits.Guilds], // Minimal intents for command registration
        });

        // Login to Discord if not in dry-run mode
        if (!this.dryRun) {
            const token = process.env.DISCORD_TOKEN;
            if (!token) {
                throw new Error("DISCORD_TOKEN environment variable is required for command registration");
            }
            await client.login(token);
        }

        try {
            const commandRepository = new DiscordCommandRepository(client);
            const useCase = new RegisterDiscordCommands(commandRepository, this.dryRun);
            const report = await useCase.execute();

            console.log("\nCommand registration report:");
            console.log(`✅ Successful modules: ${report.successCount}`);
            console.log(`❌ Failed modules: ${report.failureCount}`);

            console.log("\nDetailed results:");
            console.log(JSON.stringify(report, null, 2));

            if (this.outputPath) {
                try {
                    fs.writeFileSync(this.outputPath, JSON.stringify(report, null, 2));
                    console.log(`📝 Report saved to: ${this.outputPath}`);
                } catch (err) {
                    console.error("❌ Failed to write registration report:", err);
                }
            }

            if (report.failureCount > 0) {
                console.error("\n❌ Some modules failed to register commands");
                process.exit(1);
            }

            console.log("\n✅ Discord command registration completed successfully!");
        } finally {
            // Clean up Discord client connection
            if (!this.dryRun && client.isReady()) {
                client.destroy();
            }
        }
    }
}

new RegisterDiscordCommandsCli().run().catch((err: unknown) => {
    console.error('[COMMAND REGISTRATION FAILED]', err);
    process.exit(1);
});
