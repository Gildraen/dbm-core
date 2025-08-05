import type { InteractionHandler } from "app/domain/types/DecoratorInterfaces.js";
import { registerInteractionHandler } from "app/infrastructure/registry/DiscordRegistry.js";

/**
 * Decorator for general Discord interaction handlers
 * Automatically registers the decorated class in the DiscordRegistry
 *
 * @example
 * ```typescript
 * @InteractionHandler
 * export class ButtonHandler implements InteractionHandler {
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
export function InteractionHandler<T extends new () => InteractionHandler>(target: T): T {
    // Register the handler class when the decorator is applied
    registerInteractionHandler(target);

    return target;
}
