import type { ChannelSelectHandler } from "app/domain/types/DecoratorInterfaces.js";

// Channel Select Menu Registry
const channelSelectHandlers = new Map<string, new () => ChannelSelectHandler>();

// Registry functions
export function registerChannelSelectHandler(customId: string, handlerClass: new () => ChannelSelectHandler): void {
    if (channelSelectHandlers.has(customId)) {
        console.warn(`⚠️  Channel select handler '${customId}' is already registered. Overwriting...`);
    }
    channelSelectHandlers.set(customId, handlerClass);
    console.log(`✅ Registered channel select handler: ${customId}`);
}

export function getAllChannelSelectHandlers(): Map<string, new () => ChannelSelectHandler> {
    return new Map(channelSelectHandlers);
}

export function getChannelSelectHandler(customId: string): (new () => ChannelSelectHandler) | undefined {
    return channelSelectHandlers.get(customId);
}

export function clearChannelSelectHandlers(): void {
    channelSelectHandlers.clear();
    console.log("🧹 Cleared all channel select handler registrations");
}

/**
 * Decorator for Discord channel select menu handlers
 * Automatically registers the decorated class for runtime interaction handling
 *
 * @param customId The custom ID of the select menu to handle
 *
 * @example
 * ```typescript
 * @ChannelSelectHandler('notification-channels')
 * export class NotificationChannelSelector implements ChannelSelectHandler {
 *     customId = 'notification-channels';
 *
 *     async handle(interaction: ChannelSelectMenuInteraction): Promise<void> {
 *         const selectedChannels = interaction.values;
 *         await interaction.reply(`Selected notification channels: ${selectedChannels.join(', ')}`);
 *     }
 * }
 * ```
 */
export function ChannelSelectHandler(customId: string) {
    return function <T extends new () => ChannelSelectHandler>(target: T): T {
        // Store metadata on the class
        (target as any).selectMenuCustomId = customId;
        (target as any).selectMenuType = 'CHANNEL';

        // Register the handler
        registerChannelSelectHandler(customId, target);

        return target;
    };
}
