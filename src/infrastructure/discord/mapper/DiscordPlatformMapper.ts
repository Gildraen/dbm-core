import type { Interaction } from "app/domain/interface/platform/interactions/Interaction.js";
import type { User } from "app/domain/interface/platform/User.js";
import type { Guild } from "app/domain/interface/platform/Guild.js";
import type { Channel } from "app/domain/interface/platform/Channel.js";
import type { CommandOption } from "app/domain/interface/platform/CommandOption.js";
import type { Context } from "app/domain/interface/platform/Context.js";
import type { Response } from "app/domain/interface/platform/Response.js";
import type { Choice } from "app/domain/interface/platform/Choice.js";
import type { Client } from "app/domain/interface/platform/Client.js";
import type {
    Client as DiscordClient,
    GuildMember,
    TextChannel,
    Message,
    ClientEvents,
    Interaction as DiscordInteraction,
    ChatInputCommandInteraction,
    UserContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction,
    ButtonInteraction,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
    RoleSelectMenuInteraction,
    ChannelSelectMenuInteraction,
    MentionableSelectMenuInteraction,
    AutocompleteInteraction,
    ModalSubmitInteraction,
    InteractionResponse,
    CommandInteractionOptionResolver
} from 'discord.js';

import type { PlatformTextMessage } from "app/domain/interface/events/PlatformTextMessage.js";
import type { PlatformGuildMember } from "app/domain/interface/events/PlatformGuildMember.js";
import type { PlatformTextChannel } from "app/domain/interface/events/PlatformTextChannel.js";
import type { PlatformEvents } from "app/domain/interface/events/PlatformEvents.js";
import type { PlatformMessageBody } from "app/domain/types/events/PlatformMessageBody.js";
import type { PlatformEventArgs } from "app/domain/types/events/PlatformEventArgs.js";
import type { BiMapper, PlatformModelMappers } from 'app/domain/interface/mapper/PlatformMapper.js';

/**
 * Adapters to convert Discord.js types to platform-agnostic domain types
 * These adapters ensure modules can work with platform-agnostic interfaces
 * while infrastructure code handles Discord.js-specific implementations
 */
export class DiscordPlatformMapper implements PlatformModelMappers<DiscordClient, Message, GuildMember, TextChannel> {
    readonly client: BiMapper<DiscordClient, Client> = {
        toPlatform: (client: DiscordClient) => {
            return {
                id: client.user?.id || 'unknown',
                name: client.user?.username || 'unknown',
                application: {
                    commands: {
                        set: (commands: unknown[]) => {
                            // Discord.js ApplicationCommandManager.set accepts Collection or array
                            return client.application?.commands.set(commands as unknown as never[]) || Promise.resolve([]);
                        }
                    }
                }
            };
        },
        fromPlatform: (_: Client) => {
            throw new Error('Reverse mapping not supported: Client → DiscordClient');
        }
    };

    readonly message: BiMapper<Message, PlatformTextMessage> = {
        toPlatform: (message: Message) => {
            return {
                content: { content: message.content },
                reply: async (body: PlatformMessageBody) => {
                    const replied = await message.reply(body.content);
                    return this.message.toPlatform(replied);
                }
            };
        },
        fromPlatform: (_: PlatformTextMessage) => {
            throw new Error('Reverse mapping not supported: PlatformTextMessage → Message');
        }
    };

    readonly member: BiMapper<GuildMember, PlatformGuildMember> = {
        toPlatform: (member: GuildMember) => {
            return {
                user: {
                    tag: member.user.tag
                },
                guild: {
                    name: member.guild.name,
                    systemChannel: member.guild.systemChannel
                        ? this.textChannel.toPlatform(member.guild.systemChannel)
                        : undefined
                }
            };
        },
        fromPlatform: (_: PlatformGuildMember) => {
            throw new Error('Reverse mapping not supported: PlatformGuildMember → GuildMember');
        }
    };

    readonly textChannel: BiMapper<TextChannel, PlatformTextChannel> = {
        toPlatform: (channel: TextChannel) => {
            return {
                send: async (body: PlatformMessageBody) => {
                    const sent = await channel.send(body);
                    return this.message.toPlatform(sent);
                }
            };
        },
        fromPlatform: (_: PlatformTextChannel) => {
            throw new Error('Reverse mapping not supported: PlatformTextChannel → TextChannel');
        }
    };


    /**
     * Event argument mappers for transforming Discord.js events to platform-agnostic events
     */
    private readonly eventMappers: EventMapper = {
        ready: (args: ClientEvents["ready"]): PlatformEvents["ready"] => {
            const [client] = args;
            return [this.client.toPlatform(client)];
        },
        messageCreate: (args: ClientEvents["messageCreate"]): PlatformEvents["messageCreate"] => {
            const [message] = args;
            return [this.message.toPlatform(message)];
        },
        guildMemberAdd: (args: ClientEvents["guildMemberAdd"]): PlatformEvents["guildMemberAdd"] => {
            const [member] = args;
            return [this.member.toPlatform(member)];
        }
    };

    /**
     * Adapt event arguments based on the event name
     * @param eventName The name of the event
     * @param args The Discord.js event arguments
     * @returns Platform-agnostic event arguments
     */
    toPlatformArgs<K extends keyof PlatformEvents & keyof ClientEvents>(eventName: K, args: ClientEvents[K]): PlatformEventArgs<K> {
        const mapper = this.eventMappers[eventName];
        return mapper(args);
    }

    /**
     * Map Discord.js Interaction to platform-neutral Interaction
     */
    static mapDiscordInteraction(interaction: DiscordInteraction): Interaction {
        const baseInteraction = {
            id: interaction.id,
            userId: interaction.user.id,
            user: DiscordPlatformMapper.mapDiscordUser(interaction.user),
            guildId: interaction.guildId || undefined,
            guild: interaction.guild ? DiscordPlatformMapper.mapDiscordGuild(interaction.guild) : undefined,
            channelId: interaction.channelId || undefined,
            channel: interaction.channel ? DiscordPlatformMapper.mapDiscordChannel(interaction.channel) : undefined,
            locale: interaction.locale,
            timestamp: Date.now()
        };

        if (interaction.isChatInputCommand()) {
            return {
                ...baseInteraction,
                type: 'slash',
                commandName: interaction.commandName,
                options: [], // Simplified for now
                subcommand: interaction.options.getSubcommand(false) || undefined,
                subcommandGroup: interaction.options.getSubcommandGroup(false) || undefined
            };
        }

        if (interaction.isUserContextMenuCommand()) {
            return {
                ...baseInteraction,
                type: 'context:user',
                commandName: interaction.commandName,
                targetUser: DiscordPlatformMapper.mapDiscordUser(interaction.targetUser)
            };
        }

        if (interaction.isMessageContextMenuCommand()) {
            return {
                ...baseInteraction,
                type: 'context:message',
                commandName: interaction.commandName,
                targetMessage: {
                    id: interaction.targetMessage.id,
                    content: interaction.targetMessage.content,
                    author: DiscordPlatformMapper.mapDiscordUser(interaction.targetMessage.author)
                }
            };
        }

        if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
            return {
                ...baseInteraction,
                type: 'component',
                state: {
                    customId: interaction.customId,
                    values: 'values' in interaction ? interaction.values : undefined,
                    componentType: interaction.isButton() ? 'button' :
                        interaction.isAnySelectMenu() ? 'select' :
                            'modal'
                }
            };
        }

        if (interaction.isAutocomplete()) {
            const focusedOption = interaction.options.getFocused(true);
            return {
                ...baseInteraction,
                type: 'autocomplete',
                commandName: interaction.commandName,
                options: [], // Simplified for now
                focusedOption: {
                    name: focusedOption.name,
                    type: focusedOption.type.toString(),
                    value: focusedOption.value,
                    focused: true
                }
            };
        }

        // Fallback for unknown interaction types
        throw new Error(`Unsupported interaction type: ${interaction.type}`);
    }

    /**
     * Map Discord User to User
     */
    static mapDiscordUser(user: any): User {
        return {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator === '0' ? undefined : user.discriminator,
            displayName: user.displayName || user.globalName || undefined,
            avatarUrl: user.displayAvatarURL?.() || undefined,
            isBot: user.bot || false
        };
    }

    /**
     * Map Discord Guild to Guild
     */
    static mapDiscordGuild(guild: any): Guild {
        return {
            id: guild.id,
            name: guild.name,
            iconUrl: guild.iconURL?.() || undefined
        };
    }

    /**
     * Map Discord Channel to platform-agnostic Channel
     */
    static mapDiscordChannel(channel: any): Channel {
        return {
            id: channel.id,
            name: channel.name || 'Unknown',
            type: channel.type?.toString() || 'unknown'
        };
    }

    /**
     * Create Context from Discord interaction
     */
    static createPlatformContext(interaction: DiscordInteraction): Context {
        return {
            user: DiscordPlatformMapper.mapDiscordUser(interaction.user),
            channel: interaction.channel ? DiscordPlatformMapper.mapDiscordChannel(interaction.channel) : undefined,
            guild: interaction.guild ? DiscordPlatformMapper.mapDiscordGuild(interaction.guild) : undefined,
            timestamp: Date.now(),

            reply: async (response: Response) => {
                if ('reply' in interaction) {
                    await interaction.reply(DiscordPlatformMapper.mapPlatformResponse(response));
                } else {
                    throw new Error('Reply not available on this interaction type');
                }
            },
            edit: async (response: Response) => {
                if ('editReply' in interaction) {
                    await interaction.editReply(DiscordPlatformMapper.mapPlatformResponse(response));
                } else {
                    throw new Error('Edit not available on this interaction type');
                }
            },
            followUp: async (response: Response) => {
                if ('followUp' in interaction) {
                    await interaction.followUp(DiscordPlatformMapper.mapPlatformResponse(response));
                } else {
                    throw new Error('Follow up not available on this interaction type');
                }
            },
            defer: async (ephemeral?: boolean) => {
                if ('deferReply' in interaction) {
                    await interaction.deferReply({ ephemeral });
                } else {
                    throw new Error('Defer not available on this interaction type');
                }
            },
            autocomplete: async (choices: readonly any[]) => {
                if (interaction.isAutocomplete()) {
                    await interaction.respond(choices);
                } else {
                    throw new Error('Autocomplete only available on autocomplete interactions');
                }
            }
        };
    }

    /**
     * Map Response to Discord API response
     */
    static mapPlatformResponse(response: Response): any {
        return {
            content: response.content,
            embeds: response.embeds,
            components: response.components,
            files: response.files,
            ephemeral: response.ephemeral,
            suppressEmbeds: response.suppressEmbeds,
            tts: response.tts
        };
    }
}

type EventMapper = {
    [E in keyof PlatformEvents & keyof ClientEvents]:
    (args: ClientEvents[E]) => PlatformEvents[E];
};
