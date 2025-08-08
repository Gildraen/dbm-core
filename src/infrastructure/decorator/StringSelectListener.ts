import type { StringSelectListener } from "app/domain/types/DecoratorInterfaces.js";

// String Select Menu Registry
const stringSelectListeners = new Map<string, new () => StringSelectListener>();

// Registry functions
export function registerStringSelectListener(customId: string, listenerClass: new () => StringSelectListener): void {
    if (stringSelectListeners.has(customId)) {
        console.warn(`⚠️  String select listener '${customId}' is already registered. Overwriting...`);
    }
    stringSelectListeners.set(customId, listenerClass);
    console.log(`✅ Registered string select listener: ${customId}`);
}

export function getAllStringSelectListeners(): Map<string, new () => StringSelectListener> {
    return new Map(stringSelectListeners);
}

export function getStringSelectListener(customId: string): (new () => StringSelectListener) | undefined {
    return stringSelectListeners.get(customId);
}

export function clearStringSelectListeners(): void {
    stringSelectListeners.clear();
    console.log("🧹 Cleared all string select listener registrations");
}

/**
 * Decorator for Discord string select menu listeners
 * Automatically registers the decorated class for runtime interaction handling
 *
 * @param customId The custom ID of the select menu to handle
 *
 * @example
 * ```typescript
 * @StringSelectListener('role-selector')
 * export class RoleSelector implements StringSelectListener {
 *     customId = 'role-selector';
 *
 *     async handle(interaction: StringSelectMenuInteraction): Promise<void> {
 *         const selectedRoles = interaction.values;
 *         await interaction.reply(`Selected roles: ${selectedRoles.join(', ')}`);
 *     }
 * }
 * ```
 */
export function StringSelectListener(customId: string) {
    return function <T extends new () => StringSelectListener>(target: T): T {
        // Store metadata on the class
        (target as any).selectMenuCustomId = customId;
        (target as any).selectMenuType = 'STRING';

        // Register the listener
        registerStringSelectListener(customId, target);

        return target;
    };
}
