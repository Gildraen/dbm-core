import type { Client } from "discord.js";

import { config } from "app/domain/config/Config.js";
import { loadModule } from "app/domain/service/ModuleLoader.js";
import { ListenerSetupService } from "app/domain/service/ListenerSetupService.js";
import type { OperationResult } from "app/domain/types/OperationResult.js";
import { OperationStatus } from "app/domain/types/OperationStatus.js";
import type { ListenerRepository } from "app/domain/interface/ListenerRepository.js";

export class SetupModuleHandlers {
    private readonly listenerSetupService: ListenerSetupService;

    constructor(listenerRepository: ListenerRepository, client: Client) {
        this.listenerSetupService = new ListenerSetupService(listenerRepository, client);
    }

    async execute(): Promise<OperationResult[]> {
        const allConfig = config.getConfig();
        const enabledModules = Object.entries(allConfig)
            .filter(([, moduleConfig]) => moduleConfig.enabled)
            .map(([name]) => name);

        const results: OperationResult[] = [];

        for (const moduleName of enabledModules) {
            const startTime = Date.now();
            try {
                const module = await loadModule(moduleName);
                module.setupHandlers?.();

                results.push({
                    moduleName,
                    status: OperationStatus.SUCCESS,
                    durationMs: Date.now() - startTime
                });
            } catch (error) {
                results.push({
                    moduleName,
                    status: OperationStatus.FAILED,
                    durationMs: Date.now() - startTime,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        const totalListeners = await this.listenerSetupService.setupDiscoveredListeners();

        const successCount = results.filter(r => r.status === OperationStatus.SUCCESS).length;
        const failureCount = results.filter(r => r.status === OperationStatus.FAILED).length;

        console.log(`Module handlers setup completed: ${enabledModules.length} modules processed`);
        console.log(`✅ Success: ${successCount}, ❌ Failed: ${failureCount}, 🎧 Total listeners: ${totalListeners}`);

        return results;
    }
}
