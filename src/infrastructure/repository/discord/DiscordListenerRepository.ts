import type { Client, ClientEvents, Interaction } from "discord.js";
import type { ListenerRepository } from "app/domain/interface/ListenerRepository.js";

/**
 * Discord client implementation of ListenerRepository
 * Handles registration of event listeners with the Discord client
 */
export class DiscordListenerRepository implements ListenerRepository {
    private readonly client: Client;
    private eventListenerCount = 0;
    private interactionListenerCount = 0;

    constructor(client: Client) {
        this.client = client;
    }

    registerEventListener<K extends keyof ClientEvents>(
        eventName: K,
        handler: (...args: ClientEvents[K]) => Promise<unknown>,
        once: boolean = false
    ): void {
        if (once) {
            this.client.once(eventName, handler);
        } else {
            this.client.on(eventName, handler);
        }
        this.eventListenerCount++;
    }

    registerEventHandlerClass<K extends keyof ClientEvents>(
        eventName: K,
        handlerClass: new () => { handle: (client: Client, ...args: ClientEvents[K]) => Promise<unknown> },
        once: boolean = false
    ): void {
        const instance = new handlerClass();
        const handler = async (...args: ClientEvents[K]) => instance.handle(this.client, ...args);

        if (once) {
            this.client.once(eventName, handler);
        } else {
            this.client.on(eventName, handler);
        }
        this.eventListenerCount++;
    }

    registerInteractionListener(
        handler: (interaction: Interaction) => Promise<unknown>
    ): void {
        this.client.on('interactionCreate', handler);
        this.interactionListenerCount++;
    }

    getListenerSummary(): {
        eventListeners: number;
        interactionListeners: number;
        total: number;
    } {
        return {
            eventListeners: this.eventListenerCount,
            interactionListeners: this.interactionListenerCount,
            total: this.eventListenerCount + this.interactionListenerCount
        };
    }
}
