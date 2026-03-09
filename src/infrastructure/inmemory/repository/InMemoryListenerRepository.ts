import type { ListenerRepository } from "app/domain/interface/repository/ListenerRepository.js";
import type { Interaction } from "app/domain/interface/InteractionHandler.js";

type EventListenerEntry = {
    eventName: string;
    handler: (...args: unknown[]) => Promise<unknown>;
    once?: boolean;
};

type EventHandlerClassEntry = {
    eventName: string;
    handlerClass: new () => { handle: (...args: unknown[]) => Promise<unknown>; };
    once?: boolean;
};

export class InMemoryListenerRepository implements ListenerRepository {
    private eventListeners: Array<EventListenerEntry> = [];
    private eventHandlerClasses: Array<EventHandlerClassEntry> = [];
    private interactionListeners: Array<(interaction: Interaction) => Promise<unknown>> = [];

    registerEventListener(
        eventName: string,
        handler: (...args: unknown[]) => Promise<unknown>,
        once?: boolean
    ): void {
        this.eventListeners.push({ eventName, handler, once });
    }

    registerEventHandlerClass(
        eventName: string,
        handlerClass: new () => { handle: (...args: unknown[]) => Promise<unknown>; },
        once?: boolean
    ): void {
        this.eventHandlerClasses.push({ eventName, handlerClass, once });
    }

    registerInteractionListener(
        handler: (interaction: Interaction) => Promise<unknown>
    ): void {
        this.interactionListeners.push(handler);
    }

    getListenerSummary(): { eventListeners: number; interactionListeners: number; total: number } {
        const eventListenersCount = this.eventListeners.length + this.eventHandlerClasses.length;
        const interactionListenersCount = this.interactionListeners.length;
        return {
            eventListeners: eventListenersCount,
            interactionListeners: interactionListenersCount,
            total: eventListenersCount + interactionListenersCount,
        };
    }
}
