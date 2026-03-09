import type { UserContextMenuHandler } from "app/domain/interface/handlers/commands/UserContextMenuHandler.js";
import type { UserContextMenuMetadata } from "app/domain/types/metadata/UserContextMenuMetadata.js";
import { registryProvider } from "app/domain/registry/RegistryProvider.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";
import { Keys } from "app/domain/keys/Keys.js";

/**
 * Decorator for user context menu commands
 * Automatically registers the decorated class in the global registry
 *
 * @param name The name of the context menu command
 *
 * @example
 * ```typescript
 * @UserContextMenu('Check User Info')
 * export class UserInfoCommand implements UserContextMenuHandler {
 *     name = 'Check User Info';
 *
 *     buildCommand(): ContextMenuCommandBuilder {
 *         return new ContextMenuCommandBuilder()
 *             .setName(this.name)
 *             .setType(ApplicationCommandType.User);
 *     }
 *
 *     async execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
 *         const user = interaction.targetUser;
 *         await interaction.reply(`User: ${user.tag}`);
 *     }
 * }
 * ```
 */
export function UserContextMenu(name: string) {
    return function <T extends new () => UserContextMenuHandler>(target: T): T {
        // Register in the global registry
        const metadata: UserContextMenuMetadata = {
            name: name
        };

        const registry = registryProvider.getRegistry();
        registry.upsert({
            key: Keys.contextUser(name),
            kind: REGISTRY_KINDS.CONTEXT_USER,
            metadata: metadata,
            handlerClass: target
        });

        return target;
    };
}
