import type { PlatformTextChannel } from "./PlatformTextChannel.js";

/**
 * Guild member interface for platform events
 */
export interface PlatformGuildMember {
    readonly user: {
        readonly tag: string;
    };
    readonly guild: {
        readonly name: string;
        readonly systemChannel?: PlatformTextChannel;
    };
}
