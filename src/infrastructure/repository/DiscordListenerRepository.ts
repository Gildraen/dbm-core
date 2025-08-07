import type { Client, ClientEvents } from "discord.js";
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

    registerInteractionListener(
        handler: (interaction: any) => Promise<unknown>
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
