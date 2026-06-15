/**
 * Domain abstraction for interactions
 */

/**
 * Base interaction interface - represents any user interaction
 */
export interface Interaction {
    readonly id: string;
    readonly type?: string;
    readonly userId?: string;
    readonly channelId?: string;
    readonly guildId?: string;

    // Interaction-type-specific fields
    readonly commandName?: string;
    readonly subcommand?: string;
    readonly subcommandGroup?: string;
    readonly options?: unknown;
    readonly focusedOption?: { name: string; value: string };
    readonly customId?: string;
    readonly values?: string[];
    readonly componentType?: string;
    readonly state?: { customId?: string; values?: string[]; componentType?: string };

    reply?(content: string | Record<string, unknown>): Promise<unknown>;
    followUp?(content: string | Record<string, unknown>): Promise<unknown>;
    deferReply?(options?: Record<string, unknown>): Promise<unknown>;
    respond?(choices: Array<{ name: string; value: string }>): Promise<unknown>;
}

/**
 * Interaction handler interface
 */
export interface InteractionHandler {
    handle(interaction: Interaction): Promise<unknown>;
}
