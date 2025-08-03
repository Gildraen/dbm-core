import { config } from "app/domain/config/Config.js";
import { loadModule } from "app/domain/service/ModuleLoader.js";
import type { OperationReport } from "app/domain/types/OperationReport.js";
import type { OperationResult } from "app/domain/types/OperationResult.js";
import { OperationStatus } from "app/domain/types/OperationStatus.js";
import type { Client } from "discord.js";

export class SetupModuleHandlers {
    private readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    public async execute(): Promise<OperationReport> {
        const results: OperationResult[] = [];
        const startGlobal = Date.now();
        const enabledModules = config.getEnabledModules();

        for (const { name: moduleName } of enabledModules) {
            try {
                const loaded = await loadModule(moduleName);

                const start = Date.now();
                try {
                    loaded.setupHandlers?.(this.client);
                } catch (handlerError) {
                    throw new Error(
                        `Error in setupHandlers for module "${moduleName}": ` +
                        (handlerError instanceof Error ? handlerError.message : String(handlerError))
                    );
                }
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
                    error: error instanceof Error ? error.message : String(error)
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
