import type { PlatformEvents } from "app/domain/interface/events/PlatformEvents.js";
import type { Interaction } from "../InteractionHandler.js";

/**
 * Repository interface for managing event listeners
 * Clean Architecture compliant without direct platform dependencies
 */
export interface ListenerRepository {
    /**
     * Register an event listener
     * @param eventName The event name
     * @param handler The event handler function
     * @param once Whether this is a one-time listener
     */
    registerEventListener<K extends keyof PlatformEvents>(
        eventName: K,
        handler: (...args: PlatformEvents[K]) => Promise<unknown>,
        once?: boolean
    ): void;

    /**
     * Register an event handler class
     * @param eventName The event name
     * @param handlerClass The handler class constructor
     * @param once Whether this is a one-time listener
     */
    registerEventHandlerClass<K extends keyof PlatformEvents>(
        eventName: K,
        handlerClass: new () => { handle: (...args: PlatformEvents[K]) => Promise<unknown> },
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
