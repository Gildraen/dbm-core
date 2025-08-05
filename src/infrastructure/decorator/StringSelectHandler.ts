import type { StringSelectHandler } from "app/domain/types/DecoratorInterfaces.js";

// String Select Menu Registry
const stringSelectHandlers = new Map<string, new () => StringSelectHandler>();

// Registry functions
export function registerStringSelectHandler(customId: string, handlerClass: new () => StringSelectHandler): void {
    if (stringSelectHandlers.has(customId)) {
        console.warn(`⚠️  String select handler '${customId}' is already registered. Overwriting...`);
    }
    stringSelectHandlers.set(customId, handlerClass);
    console.log(`✅ Registered string select handler: ${customId}`);
}

export function getAllStringSelectHandlers(): Map<string, new () => StringSelectHandler> {
    return new Map(stringSelectHandlers);
}

export function getStringSelectHandler(customId: string): (new () => StringSelectHandler) | undefined {
    return stringSelectHandlers.get(customId);
}

export function clearStringSelectHandlers(): void {
    stringSelectHandlers.clear();
    console.log("🧹 Cleared all string select handler registrations");
}

/**
 * Decorator for Discord string select menu handlers
 * Automatically registers the decorated class for runtime interaction handling
 *
 * @param customId The custom ID of the select menu to handle
 *
 * @example
 * ```typescript
 * @StringSelectHandler('role-selector')
 * export class RoleSelector implements StringSelectHandler {
 *     customId = 'role-selector';
 *
 *     async handle(interaction: StringSelectMenuInteraction): Promise<void> {
 *         const selectedRoles = interaction.values;
 *         await interaction.reply(`Selected roles: ${selectedRoles.join(', ')}`);
 *     }
 * }
 * ```
 */
export function StringSelectHandler(customId: string) {
    return function <T extends new () => StringSelectHandler>(target: T): T {
        // Store metadata on the class
        (target as any).selectMenuCustomId = customId;
        (target as any).selectMenuType = 'STRING';

        // Register the handler
        registerStringSelectHandler(customId, target);

        return target;
    };
}
