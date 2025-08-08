import { config } from "app/domain/config/Config.js";
import { loadModule } from "app/domain/service/ModuleLoader.js";
import { CommandRegistrationService } from "app/domain/service/CommandRegistrationService.js";
import type { CommandRepository } from "app/domain/interface/CommandRepository.js";

export class RegisterCommands {
    private readonly commandRegistrationService: CommandRegistrationService;

    constructor(commandRepository: CommandRepository) {
        this.commandRegistrationService = new CommandRegistrationService(commandRepository);
    }

    public async execute() {
        const enabledModules = config.getEnabledModules();

        for (const { name: moduleName } of enabledModules) {
            try {
                const loaded = await loadModule(moduleName);
                await loaded.discoverCommands?.();
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`❌ Failed to discover commands for module "${moduleName}": ${errorMessage}`);
            }
        }

        try {
            await this.commandRegistrationService.registerDiscoveredCommands();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Failed to register commands with Discord: ${errorMessage}`);
        }
    }
}
