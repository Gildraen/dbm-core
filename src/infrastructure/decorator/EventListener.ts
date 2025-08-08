import type { EventListener, EventMetadata } from "app/domain/types/DecoratorInterfaces.js";
import type { ClientEvents } from "discord.js";

// Event Listener Registry
const eventListeners = new Map<keyof ClientEvents, Array<{ handlerClass: new () => EventListener<any>; once: boolean }>>();

// Registry functions
export function registerEventListener<K extends keyof ClientEvents>(
    eventName: K,
    listenerClass: new () => EventListener<K>,
    once: boolean = false
): void {
    if (!eventListeners.has(eventName)) {
        eventListeners.set(eventName, []);
    }

    const listeners = eventListeners.get(eventName);
    if (!listeners) {
        throw new Error(`Failed to get listeners for event: ${eventName}`);
    }

    const existingListener = listeners.find(l => l.handlerClass === listenerClass);

    if (existingListener) {
        console.warn(`⚠️  Event listener for '${eventName}' is already registered. Skipping...`);
        return;
    }

    listeners.push({ handlerClass: listenerClass, once });
    console.log(`✅ Registered ${once ? 'once' : 'on'} event listener for: ${eventName}`);
}

export function getAllEventListeners(): Map<keyof ClientEvents, Array<{ handlerClass: new () => EventListener<any>; once: boolean }>> {
    return new Map(eventListeners);
}

export function getEventListeners(eventName: keyof ClientEvents): Array<{ handlerClass: new () => EventListener<any>; once: boolean }> {
    return eventListeners.get(eventName) || [];
}

export function clearEventListeners(): void {
    eventListeners.clear();
    console.log("🧹 Cleared all event listener registrations");
}

/**
 * Decorator for Discord event listeners
 * Automatically registers the decorated class for handling Discord client events
 * The event type is inferred from the class implementation
 *
 * @param eventName The name of the Discord client event to handle
 * @param once Whether to handle the event only once (default: false)
 *
 * @example
 * ```typescript
 * @EventListener('messageCreate')
 * export class MessageLogger implements EventListener<'messageCreate'> {
 *     async handle(client: Client, message: Message): Promise<void> {
 *         console.log(`Message from ${message.author.tag}: ${message.content}`);
 *     }
 * }
 *
 * @EventListener('ready', true)
 * export class ReadyHandler implements EventListener<'ready'> {
 *     async handle(client: Client): Promise<void> {
 *         console.log(`Bot ${client.user?.tag} is ready!`);
 *     }
 * }
 * ```
 */
export function EventListener<K extends keyof ClientEvents>(eventName: K, once: boolean = false) {
    return function <T extends new () => EventListener<K>>(target: T): T {
        // Store metadata on the class
        (target as any).eventName = eventName;
        (target as any).eventOnce = once;

        // Register the listener with type safety
        registerEventListener(eventName, target, once);

        return target;
    };
}
