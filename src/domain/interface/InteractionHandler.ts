/**
 * Domain abstraction for Discord interactions
 * Provides Clean Architecture compliance by abstracting Discord.js specifics
 */
export interface DiscordInteraction {
    // Common interaction properties
    readonly type: number;
    readonly id: string;
    readonly customId?: string;
    readonly commandName?: string;

    // Type guards
    isChatInputCommand(): boolean;
    isUserContextMenuCommand(): boolean;
    isMessageContextMenuCommand(): boolean;
    isButton(): boolean;
    isStringSelectMenu(): boolean;
    isUserSelectMenu(): boolean;
    isRoleSelectMenu(): boolean;
    isChannelSelectMenu(): boolean;
    isMentionableSelectMenu(): boolean;
    isAutocomplete(): boolean;
    isModalSubmit(): boolean;
    isCommand(): boolean;
    isMessageComponent(): boolean;
}

/**
 * Interaction handler strategy - defines how each interaction type should be handled
 */
export interface InteractionHandler {
    name: string;
    matches: (interaction: DiscordInteraction) => boolean;
    getRegistry: () => Map<string, new () => any>;
    getKey: (interaction: any) => string;
    method: 'execute' | 'handle';
}
