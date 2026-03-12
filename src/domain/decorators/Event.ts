import type { EventHandler } from "app/domain/interface/handlers/listeners/EventHandler.js";
import type { EventListenerMetadata } from "app/domain/types/metadata/EventListenerMetadata.js";
import type { PlatformEventKey } from "app/domain/types/events/PlatformEventKey.js";
import { registryProvider } from "app/domain/registry/RegistryProvider.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";
import { Keys } from "app/domain/keys/Keys.js";

/**
 * Decorator for event listeners
 * Automatically registers the decorated class for handling platform events
 * The event type is inferred from the class implementation
 *
 * @param eventName The name of the platform event to handle
 * @param once Whether to handle the event only once (default: false)
 *
 * @example
 * ```typescript
 * @Event('messageCreate')
 * export class MessageLogger implements EventHandler {
 *     async handle(message: PlatformTextMessage): Promise<void> {
 *         console.log(`Message received: ${message.content.content}`);
 *     }
 * }
 *
 * @Event('ready', true)
 * export class ReadyHandler implements EventHandler {
 *     async handle(client: Client): Promise<void> {
 *         console.log(`Bot ${client.name} (${client.id}) is ready!`);
 *     }
 * }
 * ```
 */
export function Event(eventName: PlatformEventKey, once: boolean = false) {
    return function <T extends new () => EventHandler>(target: T): T {
        // Register in the global registry
        const metadata: EventListenerMetadata = {
            name: target.name,
            eventName: eventName,
            once
        };

        const registry = registryProvider.getRegistry();
        registry.upsert({
            key: Keys.event(eventName),
            kind: REGISTRY_KINDS.EVENT,
            metadata: metadata,
            handlerClass: target
        });

        return target;
    };
}
