import type { Client } from "../platform/Client.js";
import type { PlatformTextMessage } from "./PlatformTextMessage.js";
import type { PlatformGuildMember } from "./PlatformGuildMember.js";

/**
 * Platform-agnostic event definitions
 */
export interface PlatformEvents {
    // Bot lifecycle events
    ready: [client: Client];

    // Message events
    messageCreate: [message: PlatformTextMessage];

    // Guild member events
    guildMemberAdd: [member: PlatformGuildMember];
}
