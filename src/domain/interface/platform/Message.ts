import type { User } from "./User.js";

/**
 * Message interface - represents a message on the platform
 */
export interface Message {
    readonly id: string;
    readonly content: string;
    readonly author: User;
    readonly channelId?: string;
}
