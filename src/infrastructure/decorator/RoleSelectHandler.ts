import type { RoleSelectHandler } from "app/domain/types/DecoratorInterfaces.js";

// Role Select Menu Registry
const roleSelectHandlers = new Map<string, new () => RoleSelectHandler>();

// Registry functions
export function registerRoleSelectHandler(customId: string, handlerClass: new () => RoleSelectHandler): void {
    if (roleSelectHandlers.has(customId)) {
        console.warn(`⚠️  Role select handler '${customId}' is already registered. Overwriting...`);
    }
    roleSelectHandlers.set(customId, handlerClass);
    console.log(`✅ Registered role select handler: ${customId}`);
}

export function getAllRoleSelectHandlers(): Map<string, new () => RoleSelectHandler> {
    return new Map(roleSelectHandlers);
}

export function getRoleSelectHandler(customId: string): (new () => RoleSelectHandler) | undefined {
    return roleSelectHandlers.get(customId);
}

export function clearRoleSelectHandlers(): void {
    roleSelectHandlers.clear();
    console.log("🧹 Cleared all role select handler registrations");
}

/**
 * Decorator for Discord role select menu handlers
 * Automatically registers the decorated class for runtime interaction handling
 *
 * @param customId The custom ID of the select menu to handle
 *
 * @example
 * ```typescript
 * @RoleSelectHandler('permission-roles')
 * export class PermissionRoleSelector implements RoleSelectHandler {
 *     customId = 'permission-roles';
 *
 *     async handle(interaction: RoleSelectMenuInteraction): Promise<void> {
 *         const selectedRoles = interaction.values;
 *         await interaction.reply(`Selected permission roles: ${selectedRoles.join(', ')}`);
 *     }
 * }
 * ```
 */
export function RoleSelectHandler(customId: string) {
    return function <T extends new () => RoleSelectHandler>(target: T): T {
        // Store metadata on the class
        (target as any).selectMenuCustomId = customId;
        (target as any).selectMenuType = 'ROLE';

        // Register the handler
        registerRoleSelectHandler(customId, target);

        return target;
    };
}
