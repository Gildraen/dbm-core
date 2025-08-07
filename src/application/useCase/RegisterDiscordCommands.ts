import { config } from "app/domain/config/Config.js";
import { loadModule } from "app/domain/service/ModuleLoader.js";
import { CommandRegistrationService } from "app/domain/service/CommandRegistrationService.js";
import type { OperationReport } from "app/domain/types/OperationReport.js";
import type { OperationResult } from "app/domain/types/OperationResult.js";
import { OperationStatus } from "app/domain/types/OperationStatus.js";
import type { CommandRepository } from "app/domain/interface/CommandRepository.js";

export class RegisterDiscordCommands {
    private readonly dryRun: boolean;
    private readonly commandRegistrationService: CommandRegistrationService;

    constructor(commandRepository: CommandRepository, dryRun: boolean = false) {
        this.dryRun = dryRun;
        this.commandRegistrationService = new CommandRegistrationService(commandRepository);
    }

    public async execute(): Promise<OperationReport> {
        const results: OperationResult[] = [];
        const startGlobal = Date.now();
        const enabledModules = config.getEnabledModules();

        for (const { name: moduleName } of enabledModules) {
            try {
                const start = Date.now();

                const loaded = await loadModule(moduleName);

                await loaded.discoverCommands?.();

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

        try {
            const registrationStart = Date.now();
            
            if (this.dryRun) {
                this.commandRegistrationService.logDryRunSummary();
            } else {
                await this.commandRegistrationService.registerDiscoveredCommands();
            }
            
            const registrationDuration = Date.now() - registrationStart;

            results.push({
                moduleName: "discord-api-registration",
                status: OperationStatus.SUCCESS,
                durationMs: registrationDuration
            });

        } catch (error) {
            results.push({
                moduleName: "discord-api-registration",
                status: OperationStatus.FAILED,
                error: error instanceof Error ? error.message : String(error),
            });
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
