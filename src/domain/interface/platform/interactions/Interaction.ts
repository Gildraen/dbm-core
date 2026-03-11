import type { User } from "../User.js";
import type { Message } from "../Message.js";
import type { CommandOptions } from "../CommandOptions.js";

/**
 * Base Interaction interface - represents any platform interaction
 */
export interface Interaction {
    readonly id: string;
    readonly type?: string;
    readonly user: User;
    readonly channelId?: string;
    readonly guildId?: string;
    readonly timestamp?: number;

    // Extended properties for different interaction types
    readonly commandName?: string;
    readonly subcommand?: string;
    readonly subcommandGroup?: string;
    readonly options?: unknown[] | CommandOptions;
    readonly focusedOption?: { name: string; value: string; type?: string; focused?: boolean };
    readonly customId?: string;
    readonly values?: string[];
    readonly componentType?: string;
    readonly state?: { customId?: string; values?: string[]; componentType?: string };
    readonly targetUser?: User;
    readonly targetMessage?: Message;

    reply?(content: string | { content?: string; ephemeral?: boolean }): Promise<unknown>;
    followUp?(content: string | { content?: string; ephemeral?: boolean }): Promise<unknown>;
    deferReply?(options?: { ephemeral?: boolean }): Promise<unknown>;
    respond?(choices: Array<{ name: string; value: string }>): Promise<unknown>;
}
