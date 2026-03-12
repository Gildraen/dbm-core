import { config } from "app/domain/config/Config.js";
import { loadModule } from "app/domain/service/ModuleLoader.js";
import { ListenerRegistrationService } from "app/domain/service/ListenerRegistrationService.js";
import type { ListenerRepository } from "app/domain/interface/repository/ListenerRepository.js";
import type { PlatformRegistryReaderInterface } from "app/domain/interface/registry/PlatformRegistryReaderInterface.js";

export class RegisterListeners {
    private readonly listenerRegistrationService: ListenerRegistrationService;

    public constructor(listenerRepository: ListenerRepository, registry: PlatformRegistryReaderInterface) {
        this.listenerRegistrationService = new ListenerRegistrationService(listenerRepository, registry);
    }

    public async execute() {
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
            const totalListeners = this.listenerRegistrationService.registerDiscoveredListeners();
            console.log(`✅ Successfully registered ${totalListeners} listeners`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Failed to register listeners with Discord: ${errorMessage}`);
        }
    }
}
