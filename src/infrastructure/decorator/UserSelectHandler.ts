import type { UserSelectHandler } from "app/domain/types/DecoratorInterfaces.js";

// User Select Menu Registry
const userSelectHandlers = new Map<string, new () => UserSelectHandler>();

// Registry functions
export function registerUserSelectHandler(customId: string, handlerClass: new () => UserSelectHandler): void {
    if (userSelectHandlers.has(customId)) {
        console.warn(`⚠️  User select handler '${customId}' is already registered. Overwriting...`);
    }
    userSelectHandlers.set(customId, handlerClass);
    console.log(`✅ Registered user select handler: ${customId}`);
}

export function getAllUserSelectHandlers(): Map<string, new () => UserSelectHandler> {
    return new Map(userSelectHandlers);
}

export function getUserSelectHandler(customId: string): (new () => UserSelectHandler) | undefined {
    return userSelectHandlers.get(customId);
}

export function clearUserSelectHandlers(): void {
    userSelectHandlers.clear();
    console.log("🧹 Cleared all user select handler registrations");
}

/**
 * Decorator for Discord user select menu handlers
 * Automatically registers the decorated class for runtime interaction handling
 *
 * @param customId The custom ID of the select menu to handle
 *
 * @example
 * ```typescript
 * @UserSelectHandler('moderator-selector')
 * export class ModeratorSelector implements UserSelectHandler {
 *     customId = 'moderator-selector';
 *
 *     async handle(interaction: UserSelectMenuInteraction): Promise<void> {
 *         const selectedUsers = interaction.values;
 *         await interaction.reply(`Selected moderators: ${selectedUsers.join(', ')}`);
 *     }
 * }
 * ```
 */
export function UserSelectHandler(customId: string) {
    return function <T extends new () => UserSelectHandler>(target: T): T {
        // Store metadata on the class
        (target as any).selectMenuCustomId = customId;
        (target as any).selectMenuType = 'USER';

        // Register the handler
        registerUserSelectHandler(customId, target);

        return target;
    };
}
