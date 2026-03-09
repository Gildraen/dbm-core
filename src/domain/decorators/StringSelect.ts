import type { StringSelectHandler } from "app/domain/interface/handlers/components/StringSelectHandler.js";
import type { StringSelectMetadata } from "app/domain/types/metadata/StringSelectMetadata.js";
import { registryProvider } from "app/infrastructure/registry/RegistryProvider.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";
import { Keys } from "app/domain/keys/Keys.js";

/**
 * Decorator for string select menu listeners
 * Automatically registers the decorated class for handling string select interactions
 *
 * @param customId The custom ID of the string select menu component
 *
 * @example
 * ```typescript
 * @StringSelect('role-selector')
 * export class RoleSelector implements StringSelectListener {
 *     customId = 'role-selector';
 *
 *     async handle(interaction: StringSelectMenuInteraction): Promise<void> {
 *         const selectedRoles = interaction.values;
 *         await interaction.reply(`You selected: ${selectedRoles.join(', ')}`);
 *     }
 * }
 * ```
 */
export function StringSelect(customId: string) {
    return function <T extends new () => StringSelectHandler>(target: T): T {
        // Register in the global registry
        const metadata: StringSelectMetadata = {
            name: target.name,
            customId: customId,
            componentType: 'STRING_SELECT'
        };

        const registry = registryProvider.getRegistry();
        registry.upsert({
            key: Keys.component({ id: customId }),
            kind: REGISTRY_KINDS.STRING_SELECT,
            metadata: metadata,
            handlerClass: target
        });

        return target;
    };
}
