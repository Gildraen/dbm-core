import { config } from "app/domain/config/Config.js";
import { loadModule } from "app/domain/module/ModuleLoader.js";
import type { MigrationReport, ModuleMigrationResult } from "app/domain/types/MigrationReport.js";

export default class StartMigration {
    private readonly dryRun: boolean;

    constructor(dryRun: boolean = false) {

        this.dryRun = dryRun;
    }

    public async execute(): Promise<MigrationReport> {
        const results: ModuleMigrationResult[] = [];
        const startGlobal = Date.now();

        const enabledModules = config.getEnabledModules();

        for (const { name: moduleName } of enabledModules) {
            try {
                const loaded = await loadModule(moduleName);

                if (this.dryRun) {
                    results.push({ moduleName, status: "success" });
                } else {
                    const start = Date.now();
                    await loaded.migrate();
                    const duration = Date.now() - start;

                    results.push({ moduleName, status: "success", durationMs: duration });
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
        };
    }
}
