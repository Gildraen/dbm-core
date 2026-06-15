import type { StringSelectHandler } from "app/domain/interface/handlers/components/StringSelectHandler.js";
import { registry } from "app/domain/registry/RegistryProvider.js";
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
        registry.upsert({
            key: Keys.component({ namespace: 'string-select', id: customId }),
            kind: REGISTRY_KINDS.STRING_SELECT,
            metadata: { name: target.name, customId, componentType: 'STRING_SELECT' },
            handlerClass: target
        });

        return target;
    };
}
