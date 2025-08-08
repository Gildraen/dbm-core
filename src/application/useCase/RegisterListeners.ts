import { config } from "app/domain/config/Config.js";
import { loadModule } from "app/domain/service/ModuleLoader.js";
import { ListenerSetupService } from "app/infrastructure/service/ListenerSetupService.js";
import type { ListenerRepository } from "app/domain/interface/ListenerRepository.js";

export class RegisterListeners {
    private readonly listenerSetupService: ListenerSetupService;

    constructor(listenerRepository: ListenerRepository) {
        this.listenerSetupService = new ListenerSetupService(listenerRepository);
    }

    async execute() {
        const enabledModules = config.getEnabledModules();

        for (const { name: moduleName } of enabledModules) {
            try {
                const module = await loadModule(moduleName);
                await module.discoverListeners?.();
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`❌ Failed to discover listeners for module "${moduleName}": ${errorMessage}`);
            }
        }

        try {
            const totalListeners = await this.listenerSetupService.setupDiscoveredListeners();
            console.log(`✅ Successfully registered ${totalListeners} listeners`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Failed to register listeners with Discord: ${errorMessage}`);
        }
    }
}
