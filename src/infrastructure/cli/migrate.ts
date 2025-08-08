#!/usr/bin/env node

import { PrismaClient } from "@prisma/client";
import { StartMigration } from "app/application/useCase/StartMigration.js";
import { PrismaMigrationRepository } from "app/infrastructure/repository/prisma/PrismaMigrationRepository.js";
import fs from "fs";
import path from "path";

class StartMigrationCli {
    private readonly dryRun: boolean;
    private readonly outputPath?: string;

    constructor() {
        const args = process.argv.slice(2); // on ignore ['node', 'path/to/migrate.js']
        this.dryRun = args.includes("--dry-run");

        const outputIndex = args.findIndex(arg => arg === "--output");
        if (outputIndex !== -1 && args.length > outputIndex + 1) {
            this.outputPath = path.resolve(process.cwd(), args[outputIndex + 1]);
        }
    }

    public async run() {
        const prisma = new PrismaClient();
        const repository = new PrismaMigrationRepository(prisma);
        const useCase = new StartMigration(repository, this.dryRun);

        const report = await useCase.execute();

        console.log("\nMigration report:");
        console.log(JSON.stringify(report, null, 2));

        if (this.outputPath) {
            try {
                fs.writeFileSync(this.outputPath, JSON.stringify(report, null, 2));
                console.log(`📝 Report saved to: ${this.outputPath}`);
            } catch (err) {
                console.error("❌ Failed to write migration report:", err);
            }
        }
    }
}

new StartMigrationCli().run().catch((err: unknown) => {
    console.error('[MIGRATION FAILED]', err);
    process.exit(1);
});
