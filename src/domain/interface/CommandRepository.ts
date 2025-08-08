import type { RESTPostAPIApplicationCommandsJSONBody } from "discord.js";

/**
 * Repository interface for managing Discord application commands
 * Abstracts Discord API interactions for Clean Architecture compliance
 */
export interface CommandRepository {
    /**
     * Register commands with Discord API
     * @param commands Array of command data to register
     * @returns Promise resolving to the number of successfully registered commands
     */
    registerCommands(commands: RESTPostAPIApplicationCommandsJSONBody[]): Promise<number>;

    /**
     * Clear all registered commands
     * @returns Promise resolving to the number of cleared commands
     */
    clearAllCommands(): Promise<number>;

    /**
     * Get all currently registered commands
     * @returns Promise resolving to array of registered command data
     */
    getRegisteredCommands(): Promise<RESTPostAPIApplicationCommandsJSONBody[]>;
}
