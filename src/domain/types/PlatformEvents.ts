/**
 * Platform-agnostic event types for use by modules
 * These definitions mirror Discord.js events but don't depend on Discord.js
 */

export interface PlatformClient {
    user?: {
        tag?: string;
    };
}

export interface PlatformMessage {
    content: string;
    reply: (content: string | { content: string }) => Promise<unknown>;
}

export interface PlatformGuildMember {
    user: {
        tag: string;
    };
    guild: {
        name: string;
        systemChannel?: PlatformChannel;
    };
}

export interface PlatformChannel {
    send: (content: string | { content: string }) => Promise<unknown>;
}

// Platform-agnostic event definitions
export interface PlatformEvents {
    // Connection events
    ready: [client: PlatformClient];

    // Message events
    messageCreate: [message: PlatformMessage];

    // Guild events
    guildMemberAdd: [member: PlatformGuildMember];

    // Add other events as needed...
}

// Typed version of EventListener that uses PlatformEvents
export interface TypedEventListener<K extends keyof PlatformEvents> {
    handle(...args: PlatformEvents[K]): Promise<unknown>;
}
