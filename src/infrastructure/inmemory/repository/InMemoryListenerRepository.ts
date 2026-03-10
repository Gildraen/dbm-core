import type { ListenerRepository } from "app/domain/interface/repository/ListenerRepository.js";
import type { Interaction } from "app/domain/interface/InteractionHandler.js";
import type { PlatformEvents } from "app/domain/interface/events/PlatformEvents.js";

type EventListenerEntry = {
    eventName: keyof PlatformEvents;
    handler: (...args: unknown[]) => Promise<unknown>;
    once?: boolean;
};

type EventHandlerClassEntry = {
    eventName: keyof PlatformEvents;
    handlerClass: new () => { handle: (...args: PlatformEvents[keyof PlatformEvents]) => Promise<unknown>; };
    once?: boolean;
};

export class InMemoryListenerRepository implements ListenerRepository {
    private eventListeners: Array<EventListenerEntry> = [];
    private eventHandlerClasses: Array<EventHandlerClassEntry> = [];
    private interactionListeners: Array<(interaction: Interaction) => Promise<unknown>> = [];

    registerEventListener(
        eventName: keyof PlatformEvents,
        handler: (...args: unknown[]) => Promise<unknown>,
        once?: boolean
    ): void {
        this.eventListeners.push({ eventName, handler, once });
    }

    registerEventHandlerClass(
        eventName: keyof PlatformEvents,
        handlerClass: new () => { handle: (...args: PlatformEvents[keyof PlatformEvents]) => Promise<unknown>; },
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
