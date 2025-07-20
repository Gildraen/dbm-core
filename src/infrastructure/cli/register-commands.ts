#!/usr/bin/env node

import RegisterDiscordCommands from "app/application/useCase/RegisterDiscordCommands.js";
import fs from "fs";
import path from "path";

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

        const useCase = new RegisterDiscordCommands(this.dryRun);
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
    }
}

new RegisterDiscordCommandsCli().run().catch((err: unknown) => {
    console.error('[COMMAND REGISTRATION FAILED]', err);
    process.exit(1);
});
