import { config } from "domain/config/Config.js";
import { ModuleLoader } from "domain/module/ModuleLoader.js";
import type { MigrationReport, ModuleMigrationResult } from "domain/types/MigrationReport.js";

export default class StartMigration {
    constructor(private readonly dryRun: boolean = false) { }

    public async execute(): Promise<MigrationReport> {
        const results: ModuleMigrationResult[] = [];
        const startGlobal = Date.now();

        const enabledModules = config.getEnabledModules();

        for (const { name: moduleName } of enabledModules) {
            try {
                const loaded = await ModuleLoader.load(moduleName);

                if (loaded.migrate) {
                    if (this.dryRun) {
                        results.push({ moduleName, status: "success" });
                    } else {
                        const start = Date.now();
                        await loaded.migrate();
                        const duration = Date.now() - start;

                        results.push({ moduleName, status: "success", durationMs: duration });
                    }
                } else {
                    results.push({ moduleName, status: "skipped" });
                }
            } catch (error) {
                results.push({
                    moduleName,
                    status: "failed",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }

        const totalDuration = Date.now() - startGlobal;

        return {
            results,
            totalDurationMs: totalDuration,
            successCount: results.filter((r) => r.status === "success").length,
            failureCount: results.filter((r) => r.status === "failed").length,
            skippedCount: results.filter((r) => r.status === "skipped").length,
        };
    }
}
