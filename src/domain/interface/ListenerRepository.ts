import type { Client, ClientEvents, Interaction } from "discord.js";

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
     * Register an event handler class that needs the Discord client
     * @param eventName The Discord event name
     * @param handlerClass The handler class constructor
     * @param once Whether this is a one-time listener
     */
    registerEventHandlerClass<K extends keyof ClientEvents>(
        eventName: K,
        handlerClass: new () => { handle: (client: Client, ...args: ClientEvents[K]) => Promise<unknown> },
        once?: boolean
    ): void;

    /**
     * Register the main interaction router with the Discord client
     * @param handler The interaction handler function
     */
    registerInteractionListener(
        handler: (interaction: Interaction) => Promise<unknown>
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
