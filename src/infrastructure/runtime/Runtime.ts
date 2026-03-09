import { Client } from "discord.js";
import { RegisterListeners } from "app/application/useCase/RegisterListeners.js";
import { DiscordListenerRepository } from "app/infrastructure/discord/repository/DiscordListenerRepository.js";
import { InMemoryRegistry } from "app/infrastructure/inmemory/registry/InMemoryRegistry.js";
import { registryProvider } from "app/infrastructure/registry/RegistryProvider.js";

/**
 * Registers all event listeners from enabled modules to the Discord client.
 * Use this function in your bot's 'ready' event or startup sequence.
 *
 * @param client The Discord.js Client instance
 */
export async function registerListeners(client: Client) {
    // Ensure registry is configured with a default implementation if not already set.
    let registry;
    if (registryProvider.isConfigured()) {
        registry = registryProvider.getRegistry();
    } else {
        registry = new InMemoryRegistry();
        registryProvider.configure(registry);
    }

    const listenerRepository = new DiscordListenerRepository(client);
    const useCase = new RegisterListeners(listenerRepository, registry);

    await useCase.execute();
}
