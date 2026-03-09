import type { MessageContextMenuHandler } from "app/domain/interface/handlers/commands/MessageContextMenuHandler.js";
import type { MessageContextMenuMetadata } from "app/domain/types/metadata/MessageContextMenuMetadata.js";
import { registryProvider } from "app/infrastructure/registry/RegistryProvider.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";
import { Keys } from "app/domain/keys/Keys.js";

/**
 * Decorator for message context menu commands
 * Automatically registers the decorated class in the global registry
 *
 * @param name The name of the context menu command
 *
 * @example
 * ```typescript
 * @MessageContextMenu('Analyze Message')
 * export class MessageAnalyzer implements MessageContextMenu {
 *     name = 'Analyze Message';
 *
 *     buildCommand(): ContextMenuCommandBuilder {
 *         return new ContextMenuCommandBuilder()
 *             .setName(this.name)
 *             .setType(ApplicationCommandType.Message);
 *     }
 *
 *     async execute(interaction: MessageContextMenuCommandInteraction): Promise<void> {
 *         const message = interaction.targetMessage;
 *         await interaction.reply(`Message has ${message.content.length} characters`);
 *     }
 * }
 * ```
 */
export function MessageContextMenu(name: string) {
    return function <T extends new () => MessageContextMenuHandler>(target: T): T {
        // Register in the global registry
        const metadata: MessageContextMenuMetadata = {
            name: name
        };

        const registry = registryProvider.getRegistry();
        registry.upsert({
            key: Keys.contextMessage(name),
            kind: REGISTRY_KINDS.CONTEXT_MESSAGE,
            metadata: metadata,
            handlerClass: target
        });

        return target;
    };
}
