import { Client } from "discord.js";
import { RegisterListeners } from "app/application/useCase/RegisterListeners.js";
import { config } from "app/domain/config/Config.js";
import { DiscordListenerRepository } from "app/infrastructure/discord/repository/DiscordListenerRepository.js";
import { createRegistry } from "app/infrastructure/registry/RegistryFactory.js";
import { registryProvider } from "app/domain/registry/RegistryProvider.js";
import type { PlatformRegistryInterface } from "app/domain/interface/registry/PlatformRegistryInterface.js";

/**
 * Registers all event listeners from enabled modules to the Discord client.
 * Use this function in your bot's 'ready' event or startup sequence.
 *
 * @param client The Discord.js Client instance
 */
export async function registerListeners(client: Client) {
    // Ensure registry is configured based on .dbmrc.json if not already set.
    let registry: PlatformRegistryInterface;
    if (registryProvider.isConfigured()) {
        registry = registryProvider.getRegistry();
    } else {
        const coreConfig = config.getCoreConfig();
        registry = createRegistry(coreConfig.registry);
        registryProvider.configure(registry);
    }

    const listenerRepository = new DiscordListenerRepository(client);
    const useCase = new RegisterListeners(listenerRepository, registry);

    await useCase.execute();
}
