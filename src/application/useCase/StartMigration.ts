import { config } from "app/domain/config/Config.js";
import { loadModule } from "app/domain/service/ModuleLoader.js";
import type { MigrationRepository } from "app/domain/interface/MigrationRepository.js";
import type { OperationReport } from "app/domain/types/OperationReport.js";
import type { OperationResult } from "app/domain/types/OperationResult.js";
import { OperationStatus } from "app/domain/types/OperationStatus.js";

export class StartMigration {
    private readonly dryRun: boolean;
    private readonly migrationRepository: MigrationRepository;

    constructor(migrationRepository: MigrationRepository, dryRun: boolean = false) {
        this.migrationRepository = migrationRepository;
        this.dryRun = dryRun;
    }

    public async execute(): Promise<OperationReport> {
        const results: OperationResult[] = [];
        const startGlobal = Date.now();

        const enabledModules = config.getEnabledModules();

        for (const { name: moduleName } of enabledModules) {
            try {
                const loaded = await loadModule(moduleName);

                const start = Date.now();
                await loaded.migrate?.({
                    prisma: this.migrationRepository.getPrismaClient(),
                    dryRun: this.dryRun,
                });
                const duration = Date.now() - start;

                results.push({
                    moduleName,
                    status: OperationStatus.SUCCESS,
                    durationMs: duration
                });

            } catch (error) {
                results.push({
                    moduleName,
                    status: OperationStatus.FAILED,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }

        const totalDuration = Date.now() - startGlobal;

        return {
            results,
            totalDurationMs: totalDuration,
            successCount: results.filter((r) => r.status === OperationStatus.SUCCESS).length,
            failureCount: results.filter((r) => r.status === OperationStatus.FAILED).length,
        };
    }
}
