import type { PlatformCommand } from "app/domain/types/commands/PlatformCommand.js";

/**
 * Repository interface for managing application commands
 * Abstracts API interactions for Clean Architecture compliance
 * Now platform-agnostic - no Discord.js imports
 */
export interface CommandRepository {
    /**
     * Register commands with API
     * @param commands Array of platform-neutral commands to register
     * @returns Promise resolving to the number of successfully registered commands
     */
    registerCommands(commands: PlatformCommand[]): Promise<number>;

    /**
     * Clear all registered commands
     * @returns Promise resolving to the number of cleared commands
     */
    clearAllCommands(): Promise<number>;

    /**
     * Get all currently registered commands
     * @returns Promise resolving to array of registered commands in platform-neutral format
     */
    getRegisteredCommands(): Promise<PlatformCommand[]>;
}
