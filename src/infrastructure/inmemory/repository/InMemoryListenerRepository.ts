import type { ListenerRepository } from "app/domain/interface/repository/ListenerRepository.js";
import type { Interaction } from "app/domain/interface/InteractionHandler.js";
import type { PlatformEvents } from "app/domain/interface/events/PlatformEvents.js";

type EventListenerEntry = {
    [K in keyof PlatformEvents]: {
        eventName: K;
        handler: (...args: PlatformEvents[K]) => Promise<unknown>;
        once?: boolean;
    };
}[keyof PlatformEvents];

type EventHandlerClassEntry = {
    [K in keyof PlatformEvents]: {
        eventName: K;
        handlerClass: new () => { handle: (...args: PlatformEvents[K]) => Promise<unknown> };
        once?: boolean;
    };
}[keyof PlatformEvents];

export class InMemoryListenerRepository implements ListenerRepository {
    private eventListeners: Array<EventListenerEntry> = [];
    private eventHandlerClasses: Array<EventHandlerClassEntry> = [];
    private interactionListeners: Array<(interaction: Interaction) => Promise<unknown>> = [];

    registerEventListener<K extends keyof PlatformEvents>(
        eventName: K,
        handler: (...args: PlatformEvents[K]) => Promise<unknown>,
        once?: boolean
    ): void {
        this.eventListeners.push({ eventName, handler, once } as EventListenerEntry);
    }

    registerEventHandlerClass<K extends keyof PlatformEvents>(
        eventName: K,
        handlerClass: new () => { handle: (...args: PlatformEvents[K]) => Promise<unknown> },
        once?: boolean
    ): void {
        this.eventHandlerClasses.push({ eventName, handlerClass, once } as EventHandlerClassEntry);
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
