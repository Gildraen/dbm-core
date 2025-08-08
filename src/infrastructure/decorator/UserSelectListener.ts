import type { UserSelectListener } from "app/domain/types/DecoratorInterfaces.js";

// User Select Menu Registry
const userSelectListeners = new Map<string, new () => UserSelectListener>();

// Registry functions
export function registerUserSelectListener(customId: string, listenerClass: new () => UserSelectListener): void {
    if (userSelectListeners.has(customId)) {
        console.warn(`⚠️  User select listener '${customId}' is already registered. Overwriting...`);
    }
    userSelectListeners.set(customId, listenerClass);
    console.log(`✅ Registered user select listener: ${customId}`);
}

export function getAllUserSelectListeners(): Map<string, new () => UserSelectListener> {
    return new Map(userSelectListeners);
}

export function getUserSelectListener(customId: string): (new () => UserSelectListener) | undefined {
    return userSelectListeners.get(customId);
}

export function clearUserSelectListeners(): void {
    userSelectListeners.clear();
    console.log("🧹 Cleared all user select listener registrations");
}

/**
 * Decorator for Discord user select menu listeners
 * Automatically registers the decorated class for runtime interaction handling
 *
 * @param customId The custom ID of the select menu to handle
 *
 * @example
 * ```typescript
 * @UserSelectListener('moderator-selector')
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
export function UserSelectListener(customId: string) {
    return function <T extends new () => UserSelectListener>(target: T): T {
        // Store metadata on the class
        (target as any).selectMenuCustomId = customId;
        (target as any).selectMenuType = 'USER';

        // Register the listener
        registerUserSelectListener(customId, target);

        return target;
    };
}
