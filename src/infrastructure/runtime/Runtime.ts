import { Client } from "discord.js";
import { RegisterListeners } from "app/application/useCase/RegisterListeners.js";
import { RegisterCommands } from "app/application/useCase/RegisterCommands.js";
import { DiscordListenerRepository } from "app/infrastructure/discord/repository/DiscordListenerRepository.js";
import { DiscordCommandRepository } from "app/infrastructure/discord/repository/DiscordCommandRepository.js";
import "app/infrastructure/discord/event/RegisterCommandsOnReadyEvent.js";

/**
 * Registers all event listeners from enabled modules to the Discord client.
 * Use this function in your bot's 'ready' event or startup sequence.
 *
 * @param client The Discord.js Client instance
 */
export async function registerListeners(client: Client): Promise<void> {

    const listenerRepository = new DiscordListenerRepository(client);
    const useCase = new RegisterListeners(listenerRepository);

    await useCase.execute();
}

/**
 * Registers runtime listeners immediately and schedules command registration on ready.
 *
 * @param client The Discord.js Client instance
 */
export async function registerApplication(client: Client): Promise<void> {
    await registerListeners(client);
}

export async function registerCommands(client: Client): Promise<void> {

    const commandRepository = new DiscordCommandRepository(client);
    const useCase = new RegisterCommands(commandRepository);

    await useCase.execute();
}
