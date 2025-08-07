import type { ChannelSelectListener } from "app/domain/types/DecoratorInterfaces.js";

// Channel Select Menu Registry
const channelSelectListeners = new Map<string, new () => ChannelSelectListener>();

// Registry functions
export function registerChannelSelectListener(customId: string, listenerClass: new () => ChannelSelectListener): void {
    if (channelSelectListeners.has(customId)) {
        console.warn(`⚠️  Channel select listener '${customId}' is already registered. Overwriting...`);
    }
    channelSelectListeners.set(customId, listenerClass);
    console.log(`✅ Registered channel select listener: ${customId}`);
}

export function getAllChannelSelectListeners(): Map<string, new () => ChannelSelectListener> {
    return new Map(channelSelectListeners);
}

export function getChannelSelectListener(customId: string): (new () => ChannelSelectListener) | undefined {
    return channelSelectListeners.get(customId);
}

export function clearChannelSelectListeners(): void {
    channelSelectListeners.clear();
    console.log("🧹 Cleared all channel select listener registrations");
}

/**
 * Decorator for Discord channel select menu listeners
 * Automatically registers the decorated class for runtime interaction handling
 *
 * @param customId The custom ID of the select menu to handle
 *
 * @example
 * ```typescript
 * @ChannelSelectListener('notification-channels')
 * export class NotificationChannelSelector implements ChannelSelectListener {
 *     customId = 'notification-channels';
 *
 *     async handle(interaction: ChannelSelectMenuInteraction): Promise<void> {
 *         const selectedChannels = interaction.values;
 *         await interaction.reply(`Selected notification channels: ${selectedChannels.join(', ')}`);
 *     }
 * }
 * ```
 */
export function ChannelSelectListener(customId: string) {
    return function <T extends new () => ChannelSelectListener>(target: T): T {
        // Store metadata on the class
        (target as any).selectMenuCustomId = customId;
        (target as any).selectMenuType = 'CHANNEL';

        // Register the listener
        registerChannelSelectListener(customId, target);

        return target;
    };
}
