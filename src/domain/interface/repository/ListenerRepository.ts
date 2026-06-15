import type { Interaction } from "../InteractionHandler.js";

/**
 * Repository interface for managing event listeners
 */
export interface ListenerRepository {
    /**
     * Register an event listener by name
     * @param eventName The event name
     * @param handler The event handler function
     * @param once Whether this is a one-time listener
     */
    registerEventListener(
        eventName: string,
        handler: (...args: unknown[]) => Promise<unknown>,
        once?: boolean
    ): void;

    /**
     * Register an event handler class by event name
     * @param eventName The event name
     * @param handlerClass The handler class constructor
     * @param once Whether this is a one-time listener
     */
    registerEventHandlerClass(
        eventName: string,
        handlerClass: new () => { handle: (...args: any[]) => Promise<unknown> },
        once?: boolean
    ): void;

    /**
     * Register the main interaction router
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
