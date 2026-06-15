/**
 * Repository interface for managing application commands
 */
export interface CommandRepository {
    /**
     * Register commands
     * @param commands Array of command data to register
     * @returns Promise resolving to the number of successfully registered commands
     */
    registerCommands(commands: Record<string, unknown>[]): Promise<number>;

    /**
     * Clear all registered commands
     * @returns Promise resolving to the number of cleared commands
     */
    clearAllCommands(): Promise<number>;

    /**
     * Get all currently registered commands
     * @returns Promise resolving to array of registered command data
     */
    getRegisteredCommands(): Promise<Record<string, unknown>[]>;
}
