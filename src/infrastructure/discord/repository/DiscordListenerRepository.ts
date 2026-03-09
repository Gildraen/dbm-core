import type { Client, ClientEvents, Interaction as DiscordInteraction } from "discord.js";
import type { ListenerRepository } from "app/domain/interface/repository/ListenerRepository.js";
import type { Interaction } from "app/domain/interface/InteractionHandler.js";
import {
    DiscordPlatformMapper
} from "app/infrastructure/discord/mapper/DiscordPlatformMapper.js";
import type { PlatformEvents } from "app/domain/interface/events/PlatformEvents.js";

/**
 * Discord client implementation of ListenerRepository
 * Handles registration of event listeners with the Discord client
 * Mapping between domain abstractions and Discord.js types
 */
export class DiscordListenerRepository implements ListenerRepository {
    private readonly client: Client;
    private readonly mapper: DiscordPlatformMapper;
    private eventListenerCount = 0;
    private interactionListenerCount = 0;

    constructor(client: Client) {
        this.client = client;
        this.mapper = new DiscordPlatformMapper();
    }

    registerEventListener(
        eventName: keyof PlatformEvents,
        handler: (...args: unknown[]) => Promise<unknown>,
        once: boolean = false
    ): void {
        const typedHandler = handler as (...args: any[]) => Promise<unknown>;

        if (once) {
            this.client.once(eventName, typedHandler);
        } else {
            this.client.on(eventName, typedHandler);
        }
        this.eventListenerCount++;
    }

    registerEventHandlerClass<K extends keyof PlatformEvents>(
        eventName: K,
        handlerClass: new () => { handle: (...args: PlatformEvents[K]) => Promise<unknown> },
        once: boolean = false
    ): void {
        const instance = new handlerClass();
        const handler = async (...args: ClientEvents[typeof eventName]) => {
            const platformArgs = this.mapper.toPlatformArgs(eventName, args);
            return instance.handle(...platformArgs);
        };

        if (once) {
            this.client.once(eventName, handler);
        } else {
            this.client.on(eventName, handler);
        }
        this.eventListenerCount++;
    }

    /**
     * Adapter to convert Discord.js Interaction to Interaction domain type
     * @param interaction The Discord.js interaction
     */
    private adaptInteraction(interaction: DiscordInteraction): Interaction {
        // Map to the interface expected by the repository
        const baseInteraction = {
            id: interaction.id,
            userId: interaction.user.id,
            user: {
                id: interaction.user.id,
                username: interaction.user.username,
                discriminator: interaction.user.discriminator === '0' ? undefined : interaction.user.discriminator,
                displayName: interaction.user.displayName || interaction.user.globalName || undefined,
                avatarUrl: interaction.user.displayAvatarURL() || undefined,
                isBot: interaction.user.bot || false
            },
            guildId: interaction.guildId || undefined,
            guild: interaction.guild ? {
                id: interaction.guild.id,
                name: interaction.guild.name,
                iconUrl: interaction.guild.iconURL() || undefined
            } : undefined,
            channelId: interaction.channelId || undefined,
            channel: interaction.channel ? {
                id: interaction.channel.id,
                name: 'name' in interaction.channel ? interaction.channel.name || 'Unknown' : 'Unknown',
                type: interaction.channel.type.toString() || 'unknown'
            } : undefined,
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
                targetUser: {
                    id: interaction.targetUser.id,
                    username: interaction.targetUser.username,
                    discriminator: interaction.targetUser.discriminator === '0' ? undefined : interaction.targetUser.discriminator,
                    displayName: interaction.targetUser.displayName || interaction.targetUser.globalName || undefined,
                    avatarUrl: interaction.targetUser.displayAvatarURL() || undefined,
                    isBot: interaction.targetUser.bot || false
                }
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
                    author: {
                        id: interaction.targetMessage.author.id,
                        username: interaction.targetMessage.author.username,
                        discriminator: interaction.targetMessage.author.discriminator === '0' ? undefined : interaction.targetMessage.author.discriminator,
                        displayName: interaction.targetMessage.author.displayName || interaction.targetMessage.author.globalName || undefined,
                        avatarUrl: interaction.targetMessage.author.displayAvatarURL() || undefined,
                        isBot: interaction.targetMessage.author.bot || false
                    }
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
                    focused: true as const
                }
            };
        }

        // Fallback for unknown interaction types
        throw new Error(`Unsupported interaction type: ${interaction.type}`);
    }

    registerInteractionListener(
        handler: (interaction: Interaction) => Promise<unknown>
    ): void {
        // Create adapter that converts Discord.js interaction to domain type
        const adaptedHandler = async (discordInteraction: DiscordInteraction) => {
            const domainInteraction = this.adaptInteraction(discordInteraction);
            return handler(domainInteraction);
        };

        this.client.on('interactionCreate', adaptedHandler);
        this.interactionListenerCount++;
    }

    getListenerSummary(): {
        eventListeners: number;
        interactionListeners: number;
        total: number;
    } {
        return {
            eventListeners: this.eventListenerCount,
            interactionListeners: this.interactionListenerCount,
            total: this.eventListenerCount + this.interactionListenerCount
        };
    }
}