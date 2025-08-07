import type { Client, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import type { CommandRepository } from "app/domain/interface/CommandRepository.js";

/**
 * Discord API implementation of CommandRepository
 * Handles registration and management of Discord application commands
 */
export class DiscordCommandRepository implements CommandRepository {
    private readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async registerCommands(commands: RESTPostAPIApplicationCommandsJSONBody[]): Promise<number> {
        if (!this.client.application) {
            throw new Error("Discord client application is not available");
        }

        if (commands.length === 0) {
            return 0;
        }

        const registeredCommands = await this.client.application.commands.set(commands);
        return registeredCommands.size;
    }

    async clearAllCommands(): Promise<number> {
        if (!this.client.application) {
            throw new Error("Discord client application is not available");
        }

        const currentCommands = await this.client.application.commands.fetch();
        const commandCount = currentCommands.size;

        await this.client.application.commands.set([]);

        return commandCount;
    }

    async getRegisteredCommands(): Promise<RESTPostAPIApplicationCommandsJSONBody[]> {
        if (!this.client.application) {
            throw new Error("Discord client application is not available");
        }

        const commands = await this.client.application.commands.fetch();
        return commands.map(command => command.toJSON() as RESTPostAPIApplicationCommandsJSONBody);
    }
}
