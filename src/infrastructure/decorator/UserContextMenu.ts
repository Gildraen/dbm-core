import type { UserContextMenu } from "app/domain/types/DecoratorInterfaces.js";

// User Context Menu Registry
const userContextMenus = new Map<string, new () => UserContextMenu>();

// Registry functions
export function registerUserContextMenu(name: string, commandClass: new () => UserContextMenu): void {
    if (userContextMenus.has(name)) {
        console.warn(`⚠️  User context menu '${name}' is already registered. Overwriting...`);
    }
    userContextMenus.set(name, commandClass);
    console.log(`✅ Registered user context menu: ${name}`);
}

export function getAllUserContextMenus(): Map<string, new () => UserContextMenu> {
    return new Map(userContextMenus);
}

export function clearUserContextMenus(): void {
    userContextMenus.clear();
    console.log("🧹 Cleared all user context menu registrations");
}

/**
 * Decorator for Discord user context menu commands
 * Automatically registers the decorated class
 *
 * @param name The name of the context menu command
 *
 * @example
 * ```typescript
 * @UserContextMenu('Check User Info')
 * export class UserInfoCommand implements UserContextMenu {
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
    return function <T extends new () => UserContextMenu>(target: T): T {
        // Store metadata on the class
        (target as any).contextMenuName = name;
        (target as any).contextMenuType = 'USER';

        // Register the command
        registerUserContextMenu(name, target);

        return target;
    };
}
