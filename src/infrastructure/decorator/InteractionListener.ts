import type { InteractionListener } from "app/domain/types/DecoratorInterfaces.js";
import { registerInteractionListener } from "app/infrastructure/registry/DiscordRegistry.js";

/**
 * Decorator for general Discord interaction listeners
 * Automatically registers the decorated class in the DiscordRegistry
 *
 * @example
 * ```typescript
 * @InteractionListener
 * export class ButtonHandler implements InteractionListener {
 *     setup(client: Client): void {
 *         client.on('interactionCreate', async (interaction) => {
 *             if (interaction.isButton()) {
 *                 // Handle button interactions
 *             }
 *         });
 *     }
 * }
 * ```
 */
export function InteractionListener<T extends new () => InteractionListener>(target: T): T {
    // Register the listener class when the decorator is applied
    registerInteractionListener(target);

    return target;
}
