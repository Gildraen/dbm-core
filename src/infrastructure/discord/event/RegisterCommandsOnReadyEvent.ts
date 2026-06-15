import type { Client } from "discord.js";
import { Event } from "app/domain/decorators/Event.js";
import { DiscordCommandRepository } from "app/infrastructure/discord/repository/DiscordCommandRepository.js";
import { RegisterCommands } from "app/application/useCase/RegisterCommands.js";

@Event("ready", true)
export class RegisterCommandsOnReadyEvent {
    readonly name = "RegisterCommandsOnReadyEvent";

    async handle(...args: unknown[]): Promise<void> {
        const client = args[0] as Client;
        try {
            const commandRepository = new DiscordCommandRepository(client);
            const useCase = new RegisterCommands(commandRepository);
            await useCase.execute();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Failed to register commands on ready: ${errorMessage}`);
        }
    }
}
