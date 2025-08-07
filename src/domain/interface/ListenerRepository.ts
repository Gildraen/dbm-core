import type { Client, ClientEvents } from "discord.js";

/**
 * Repository interface for managing Discord event listeners
 * Abstracts Discord client interactions for Clean Architecture compliance
 */
export interface ListenerRepository {
    /**
     * Register an event listener with the Discord client
     * @param eventName The Discord event name
     * @param handler The event handler function
     * @param once Whether this is a one-time listener
     */
    registerEventListener<K extends keyof ClientEvents>(
        eventName: K,
        handler: (...args: ClientEvents[K]) => Promise<unknown>,
        once?: boolean
    ): void;

    /**
     * Register the main interaction router with the Discord client
     * @param handler The interaction handler function
     */
    registerInteractionListener(
        handler: (interaction: any) => Promise<unknown>
    ): void;

    /**
     * Get summary of registered listeners
     */
    getListenerSummary(): {
        eventListeners: number;
        interactionListeners: number;
        total: number;
    };
}
