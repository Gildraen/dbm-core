import { Client } from "discord.js";
import { RegisterListeners } from "app/application/useCase/RegisterListeners.js";
import { RegisterCommands } from "app/application/useCase/RegisterCommands.js";
import { DiscordListenerRepository } from "app/infrastructure/discord/repository/DiscordListenerRepository.js";
import { DiscordCommandRepository } from "app/infrastructure/discord/repository/DiscordCommandRepository.js";
import { runtimeInitializer } from "app/infrastructure/runtime/InitializedRuntimeHandlers.js";
import { registry } from "app/domain/registry/RegistryProvider.js";
import type { RuntimeContext } from "app/application/interface/RuntimeContext.js";

/**
 * Registers all event listeners from enabled modules to the Discord client.
 * Use this function in your bot's 'ready' event or startup sequence.
 *
 * @param client The Discord.js Client instance
 * @param context Optional RuntimeContext; uses global registry if not provided
 */
export async function registerListeners(client: Client, context?: RuntimeContext): Promise<void> {

    const listenerRepository = new DiscordListenerRepository(client);
    const useCase = new RegisterListeners(listenerRepository, context);

    await useCase.execute();
}

/**
 * Registers runtime listeners immediately and schedules command registration on ready.
 * This is the primary entry point for bot runtime initialization.
 *
 * @param client The Discord.js Client instance
 *
 * @example
 * ```typescript
 * const client = new Client({ intents: [...] });
 * await registerApplication(client);
 * ```
 */
export async function registerApplication(client: Client): Promise<void> {
    // Initialize default runtime handlers explicitly (no side-effects from imports)
    const defaultContext: RuntimeContext = { registry };
    runtimeInitializer.initRegisterCommandsOnReady(defaultContext);

    // Register listeners with the default context
    await registerListeners(client, defaultContext);
}

export async function registerCommands(client: Client): Promise<void> {

    const commandRepository = new DiscordCommandRepository(client);
    const useCase = new RegisterCommands(commandRepository);

    await useCase.execute();
}
