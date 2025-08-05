import type { EventHandler, EventMetadata } from "app/domain/types/DecoratorInterfaces.js";
import type { ClientEvents } from "discord.js";

// Event Handler Registry
const eventHandlers = new Map<keyof ClientEvents, Array<{ handlerClass: new () => EventHandler; once: boolean }>>();

// Registry functions
export function registerEventHandler(eventName: keyof ClientEvents, handlerClass: new () => EventHandler, once: boolean = false): void {
    if (!eventHandlers.has(eventName)) {
        eventHandlers.set(eventName, []);
    }

    const handlers = eventHandlers.get(eventName);
    if (!handlers) {
        throw new Error(`Failed to get handlers for event: ${eventName}`);
    }

    const existingHandler = handlers.find(h => h.handlerClass === handlerClass);

    if (existingHandler) {
        console.warn(`⚠️  Event handler for '${eventName}' is already registered. Skipping...`);
        return;
    }

    handlers.push({ handlerClass, once });
    console.log(`✅ Registered ${once ? 'once' : 'on'} event handler for: ${eventName}`);
}

export function getAllEventHandlers(): Map<keyof ClientEvents, Array<{ handlerClass: new () => EventHandler; once: boolean }>> {
    return new Map(eventHandlers);
}

export function getEventHandlers(eventName: keyof ClientEvents): Array<{ handlerClass: new () => EventHandler; once: boolean }> {
    return eventHandlers.get(eventName) || [];
}

export function clearEventHandlers(): void {
    eventHandlers.clear();
    console.log("🧹 Cleared all event handler registrations");
}

/**
 * Decorator for Discord event handlers
 * Automatically registers the decorated class for handling Discord client events
 *
 * @param eventName The name of the Discord client event to handle
 * @param once Whether to handle the event only once (default: false)
 *
 * @example
 * ```typescript
 * @EventHandler('messageCreate')
 * export class MessageLogger implements EventHandler {
 *     async handle(message: Message): Promise<void> {
 *         console.log(`Message from ${message.author.tag}: ${message.content}`);
 *     }
 * }
 *
 * @EventHandler('ready', true)
 * export class ReadyHandler implements EventHandler {
 *     async handle(client: Client): Promise<void> {
 *         console.log(`Bot ${client.user?.tag} is ready!`);
 *     }
 * }
 * ```
 */
export function EventHandler(eventName: keyof ClientEvents, once: boolean = false) {
    return function <T extends new () => EventHandler>(target: T): T {
        // Store metadata on the class
        (target as any).eventName = eventName;
        (target as any).eventOnce = once;

        // Register the handler
        registerEventHandler(eventName, target, once);

        return target;
    };
}
