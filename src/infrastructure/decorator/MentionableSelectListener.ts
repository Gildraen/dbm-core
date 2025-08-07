import type { MentionableSelectListener } from "app/domain/types/DecoratorInterfaces.js";

// Mentionable Select Menu Registry
const mentionableSelectListeners = new Map<string, new () => MentionableSelectListener>();

// Registry functions
export function registerMentionableSelectListener(customId: string, listenerClass: new () => MentionableSelectListener): void {
    if (mentionableSelectListeners.has(customId)) {
        console.warn(`⚠️  Mentionable select listener '${customId}' is already registered. Overwriting...`);
    }
    mentionableSelectListeners.set(customId, listenerClass);
    console.log(`✅ Registered mentionable select listener: ${customId}`);
}

export function getAllMentionableSelectListeners(): Map<string, new () => MentionableSelectListener> {
    return new Map(mentionableSelectListeners);
}

export function getMentionableSelectListener(customId: string): (new () => MentionableSelectListener) | undefined {
    return mentionableSelectListeners.get(customId);
}

export function clearMentionableSelectListeners(): void {
    mentionableSelectListeners.clear();
    console.log("🧹 Cleared all mentionable select listener registrations");
}

/**
 * Decorator for Discord mentionable (users and roles) select menu listeners
 * Automatically registers the decorated class for runtime interaction handling
 *
 * @param customId The custom ID of the select menu to handle
 *
 * @example
 * ```typescript
 * @MentionableSelectListener('ping-targets')
 * export class PingTargetSelector implements MentionableSelectListener {
 *     customId = 'ping-targets';
 *
 *     async handle(interaction: MentionableSelectMenuInteraction): Promise<void> {
 *         const selectedMentionables = interaction.values;
 *         await interaction.reply(`Selected ping targets: ${selectedMentionables.join(', ')}`);
 *     }
 * }
 * ```
 */
export function MentionableSelectListener(customId: string) {
    return function <T extends new () => MentionableSelectListener>(target: T): T {
        // Store metadata on the class
        (target as any).selectMenuCustomId = customId;
        (target as any).selectMenuType = 'MENTIONABLE';

        // Register the listener
        registerMentionableSelectListener(customId, target);

        return target;
    };
}
