import type { MentionableSelectHandler } from "app/domain/types/DecoratorInterfaces.js";

// Mentionable Select Menu Registry
const mentionableSelectHandlers = new Map<string, new () => MentionableSelectHandler>();

// Registry functions
export function registerMentionableSelectHandler(customId: string, handlerClass: new () => MentionableSelectHandler): void {
    if (mentionableSelectHandlers.has(customId)) {
        console.warn(`⚠️  Mentionable select handler '${customId}' is already registered. Overwriting...`);
    }
    mentionableSelectHandlers.set(customId, handlerClass);
    console.log(`✅ Registered mentionable select handler: ${customId}`);
}

export function getAllMentionableSelectHandlers(): Map<string, new () => MentionableSelectHandler> {
    return new Map(mentionableSelectHandlers);
}

export function getMentionableSelectHandler(customId: string): (new () => MentionableSelectHandler) | undefined {
    return mentionableSelectHandlers.get(customId);
}

export function clearMentionableSelectHandlers(): void {
    mentionableSelectHandlers.clear();
    console.log("🧹 Cleared all mentionable select handler registrations");
}

/**
 * Decorator for Discord mentionable (users and roles) select menu handlers
 * Automatically registers the decorated class for runtime interaction handling
 *
 * @param customId The custom ID of the select menu to handle
 *
 * @example
 * ```typescript
 * @MentionableSelectHandler('ping-targets')
 * export class PingTargetSelector implements MentionableSelectHandler {
 *     customId = 'ping-targets';
 *
 *     async handle(interaction: MentionableSelectMenuInteraction): Promise<void> {
 *         const selectedMentionables = interaction.values;
 *         await interaction.reply(`Selected ping targets: ${selectedMentionables.join(', ')}`);
 *     }
 * }
 * ```
 */
export function MentionableSelectHandler(customId: string) {
    return function <T extends new () => MentionableSelectHandler>(target: T): T {
        // Store metadata on the class
        (target as any).selectMenuCustomId = customId;
        (target as any).selectMenuType = 'MENTIONABLE';

        // Register the handler
        registerMentionableSelectHandler(customId, target);

        return target;
    };
}
