import type { ListenerRepository } from "app/domain/interface/repository/ListenerRepository.js";
import type { Interaction } from "app/domain/interface/InteractionHandler.js";

export class InMemoryListenerRepository implements ListenerRepository {
    private eventListeners: Array<{
        eventName: string;
        handler: (...args: unknown[]) => Promise<unknown>;
        once?: boolean;
    }> = [];
    private eventHandlerClasses: Array<{
        eventName: string;
        handlerClass: new () => { handle: (...args: any[]) => Promise<unknown> };
        once?: boolean;
    }> = [];
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
        handlerClass: new () => { handle: (...args: any[]) => Promise<unknown> },
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

    async emit(eventName: string, ...args: unknown[]): Promise<void> {
        for (const entry of this.eventListeners.filter((e) => e.eventName === eventName)) {
            await entry.handler(...args);
        }

        for (const entry of this.eventHandlerClasses.filter((e) => e.eventName === eventName)) {
            await new entry.handlerClass().handle(...args);
        }

        this.eventListeners = this.eventListeners.filter(
            (e) => !(e.eventName === eventName && e.once)
        );
        this.eventHandlerClasses = this.eventHandlerClasses.filter(
            (e) => !(e.eventName === eventName && e.once)
        );
    }

    async dispatch(interaction: Interaction): Promise<unknown> {
        const results: unknown[] = [];
        for (const handler of this.interactionListeners) {
            results.push(await handler(interaction));
        }
        return results[0];
    }
}
