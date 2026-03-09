import type { User } from "./User.js";
import type { Channel } from "./Channel.js";
import type { Guild } from "./Guild.js";
import type { Response } from "./Response.js";
import type { Choice } from "./Choice.js";

/**
 * Context interface - provides contextual information and methods for interactions
 */
export interface Context {
    user: User;
    channel?: Channel;
    guild?: Guild;
    timestamp: number;

    // Interaction methods
    reply?(response: Response): Promise<unknown>;
    edit?(response: Response): Promise<unknown>;
    followUp?(response: Response): Promise<unknown>;
    defer?(ephemeral?: boolean): Promise<unknown>;
    autocomplete?(choices: readonly Choice[]): Promise<unknown>;
}
