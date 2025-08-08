import type {
    Client, Message, GuildMember, Channel
} from 'discord.js';

import type {
    PlatformClient, PlatformMessage, PlatformGuildMember, PlatformChannel
} from 'app/domain/types/PlatformEvents.js';

/**
 * Adapters to convert Discord.js types to platform-agnostic domain types
 * These adapters ensure modules can work with platform-agnostic interfaces
 * while infrastructure code handles Discord.js-specific implementations
 */
export class DiscordPlatformAdapter {

    private adaptClient(client: Client): PlatformClient {
        return {
            user: client.user ? {
                tag: client.user.tag
            } : undefined
        };
    }

    /**
     * Adapt Discord.js Message to PlatformMessage
     */
    private adaptMessage(message: Message): PlatformMessage {
        return {
            content: message.content,
            reply: async (content: string | { content: string }) => {
                return message.reply(content);
            }
        };
    }

    /**
     * Adapt Discord.js GuildMember to PlatformGuildMember
     */
    private adaptGuildMember(member: GuildMember): PlatformGuildMember {
        return {
            user: {
                tag: member.user.tag
            },
            guild: {
                name: member.guild.name,
                systemChannel: member.guild.systemChannel
                    ? this.adaptChannel(member.guild.systemChannel)
                    : undefined
            }
        };
    }

    /**
     * Adapt Discord.js Channel to PlatformChannel
     */
    private adaptChannel(channel: Channel & { send?: Function }): PlatformChannel | undefined {
        if (typeof channel.send !== 'function') return undefined;

        return {
            send: async (content: string | { content: string }) => {
                // TypeScript doesn't understand this is safe after our check above
                return (channel as any).send(content);
            }
        };
    }

    /**
     * Adapt event arguments based on the event name
     * @param eventName The name of the event
     * @param args The Discord.js event arguments
     * @returns Platform-agnostic event arguments
     */
    adaptEventArgs(eventName: string, args: any[]): unknown[] {
        switch (eventName) {
            case 'ready':
                return [this.adaptClient(args[0])];
            case 'messageCreate':
                return [this.adaptMessage(args[0])];
            case 'guildMemberAdd':
                return [this.adaptGuildMember(args[0])];
            // Add other event types as needed
            default:
                // For unsupported events, just return the original args
                return args;
        }
    }
}
