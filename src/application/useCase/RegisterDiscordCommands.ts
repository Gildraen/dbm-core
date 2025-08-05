import { config } from "app/domain/config/Config.js";
import { loadModule } from "app/domain/service/ModuleLoader.js";
import { CommandRegistrationTool } from "app/domain/service/CommandRegistrationTool.js";
import type { OperationReport } from "app/domain/types/OperationReport.js";
import type { OperationResult } from "app/domain/types/OperationResult.js";
import { OperationStatus } from "app/domain/types/OperationStatus.js";
import type { Client } from "discord.js";

export default class RegisterDiscordCommands {
    private readonly dryRun: boolean;
    private readonly client: Client;

    constructor(client: Client, dryRun: boolean = false) {
        this.client = client;
        this.dryRun = dryRun;
    }

    public async execute(): Promise<OperationReport> {
        const results: OperationResult[] = [];
        const startGlobal = Date.now();
        const enabledModules = config.getEnabledModules();

        const commandTool = new CommandRegistrationTool(this.dryRun);

        for (const { name: moduleName } of enabledModules) {
            try {
                const loaded = await loadModule(moduleName);

                const start = Date.now();
                await loaded.register?.({
                    commandTool: commandTool
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

        try {
            const registrationStart = Date.now();
            await commandTool.performDiscordRegistration(this.client);
            const registrationDuration = Date.now() - registrationStart;

            const summary = commandTool.getCommandSummary();
            console.log(`🎯 Registration Summary:`, summary);

            // Add registration phase result
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
