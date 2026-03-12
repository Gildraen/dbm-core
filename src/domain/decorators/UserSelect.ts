import type { UserSelectHandler } from "app/domain/interface/handlers/components/UserSelectHandler.js";
import type { UserSelectMetadata } from "app/domain/types/metadata/UserSelectMetadata.js";
import { registryProvider } from "app/domain/registry/RegistryProvider.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";
import { Keys } from "app/domain/keys/Keys.js";

/**
 * Decorator for user select menu listeners
 * Automatically registers the decorated class for runtime interaction handling
 *
 * @param customId The custom ID of the select menu to handle
 *
 * @example
 * ```typescript
 * @UserSelect('moderator-selector')
 * export class ModeratorSelector implements UserSelectListener {
 *     customId = 'moderator-selector';
 *
 *     async handle(interaction: UserSelectMenuInteraction): Promise<void> {
 *         const selectedUsers = interaction.values;
 *         await interaction.reply(`Selected moderators: ${selectedUsers.join(', ')}`);
 *     }
 * }
 * ```
 */
export function UserSelect(customId: string) {
    return function <T extends new () => UserSelectHandler>(target: T): T {
        // Register in the global registry
        const metadata: UserSelectMetadata = {
            name: target.name,
            customId: customId,
            componentType: 'USER_SELECT'
        };

        const registry = registryProvider.getRegistry();
        registry.upsert({
            key: Keys.component({ namespace: 'user-select', id: customId }),
            kind: REGISTRY_KINDS.USER_SELECT,
            metadata: metadata,
            handlerClass: target
        });

        return target;
    };
}
