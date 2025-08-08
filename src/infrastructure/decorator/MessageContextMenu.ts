import type { MessageContextMenu } from "app/domain/types/DecoratorInterfaces.js";

// Message Context Menu Registry
const messageContextMenus = new Map<string, new () => MessageContextMenu>();

// Registry functions
export function registerMessageContextMenu(name: string, commandClass: new () => MessageContextMenu): void {
    if (messageContextMenus.has(name)) {
        console.warn(`⚠️  Message context menu '${name}' is already registered. Overwriting...`);
    }
    messageContextMenus.set(name, commandClass);
    console.log(`✅ Registered message context menu: ${name}`);
}

export function getAllMessageContextMenus(): Map<string, new () => MessageContextMenu> {
    return new Map(messageContextMenus);
}

export function clearMessageContextMenus(): void {
    messageContextMenus.clear();
    console.log("🧹 Cleared all message context menu registrations");
}

/**
 * Decorator for Discord message context menu commands
 * Automatically registers the decorated class
 *
 * @param name The name of the context menu command
 *
 * @example
 * ```typescript
 * @MessageContextMenu('Analyze Message')
 * export class MessageAnalyzer implements MessageContextMenu {
 *     name = 'Analyze Message';
 *
 *     buildCommand(): ContextMenuCommandBuilder {
 *         return new ContextMenuCommandBuilder()
 *             .setName(this.name)
 *             .setType(ApplicationCommandType.Message);
 *     }
 *
 *     async execute(interaction: MessageContextMenuCommandInteraction): Promise<void> {
 *         const message = interaction.targetMessage;
 *         await interaction.reply(`Message has ${message.content.length} characters`);
 *     }
 * }
 * ```
 */
export function MessageContextMenu(name: string) {
    return function <T extends new () => MessageContextMenu>(target: T): T {
        // Store metadata on the class
        (target as any).contextMenuName = name;
        (target as any).contextMenuType = 'MESSAGE';

        // Register the command
        registerMessageContextMenu(name, target);

        return target;
    };
}
