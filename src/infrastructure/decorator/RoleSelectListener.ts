import type { RoleSelectListener } from "app/domain/types/DecoratorInterfaces.js";

// Role Select Menu Registry
const roleSelectListeners = new Map<string, new () => RoleSelectListener>();

// Registry functions
export function registerRoleSelectListener(customId: string, listenerClass: new () => RoleSelectListener): void {
    if (roleSelectListeners.has(customId)) {
        console.warn(`⚠️  Role select listener '${customId}' is already registered. Overwriting...`);
    }
    roleSelectListeners.set(customId, listenerClass);
    console.log(`✅ Registered role select listener: ${customId}`);
}

export function getAllRoleSelectListeners(): Map<string, new () => RoleSelectListener> {
    return new Map(roleSelectListeners);
}

export function getRoleSelectListener(customId: string): (new () => RoleSelectListener) | undefined {
    return roleSelectListeners.get(customId);
}

export function clearRoleSelectListeners(): void {
    roleSelectListeners.clear();
    console.log("🧹 Cleared all role select listener registrations");
}

/**
 * Decorator for Discord role select menu listeners
 * Automatically registers the decorated class for runtime interaction handling
 *
 * @param customId The custom ID of the select menu to handle
 *
 * @example
 * ```typescript
 * @RoleSelectListener('permission-selector')
 * export class PermissionSelector implements RoleSelectListener {
 *     customId = 'permission-selector';
 *
 *     async handle(interaction: RoleSelectMenuInteraction): Promise<void> {
 *         const selectedRoles = interaction.values;
 *         await interaction.reply(`Selected roles: ${selectedRoles.join(', ')}`);
 *     }
 * }
 * ```
 */
export function RoleSelectListener(customId: string) {
    return function <T extends new () => RoleSelectListener>(target: T): T {
        // Store metadata on the class
        (target as any).selectMenuCustomId = customId;
        (target as any).selectMenuType = 'ROLE';

        // Register the listener
        registerRoleSelectListener(customId, target);

        return target;
    };
}
