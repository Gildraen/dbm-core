import type { Client, ClientEvents, Interaction as DiscordInteraction } from "discord.js";
import type { ListenerRepository } from "app/domain/interface/repository/ListenerRepository.js";
import type { Interaction } from "app/domain/interface/InteractionHandler.js";
import type { CommandOptions } from "app/domain/interface/platform/CommandOptions.js";
import {
    DiscordPlatformMapper
} from "app/infrastructure/discord/mapper/DiscordPlatformMapper.js";
import type { PlatformEvents } from "app/domain/interface/events/PlatformEvents.js";
import type { CommandInteractionOptionResolver } from "discord.js";

type OptionsResolver = Pick<
    CommandInteractionOptionResolver,
    'getString' | 'getInteger' | 'getBoolean' | 'getUser' | 'getChannel' | 'getRole'
>;

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

    registerEventListener<K extends keyof PlatformEvents>(
        eventName: K,
        handler: (...args: PlatformEvents[K]) => Promise<unknown>,
        once: boolean = false
    ): void {
        const discordEventName = this.mapper.getDiscordEventKey(eventName);
        const typedHandler = async (...args: ClientEvents[typeof discordEventName]) => handler(...this.mapper.toPlatformArgs(eventName, args));

        if (once) {
            this.client.once(discordEventName, typedHandler);
        } else {
            this.client.on(discordEventName, typedHandler);
        }

        this.eventListenerCount++;
    }

    registerEventHandlerClass<K extends keyof PlatformEvents>(
        eventName: K,
        handlerClass: new () => { handle: (...args: PlatformEvents[K]) => Promise<unknown> },
        once: boolean = false
    ): void {
        const instance = new handlerClass();
        const discordEventName = this.mapper.getDiscordEventKey(eventName);
        const handler = async (...args: ClientEvents[typeof discordEventName]) => {
            const platformArgs = this.mapper.toPlatformArgs(eventName, args);
            return instance.handle(...platformArgs);
        };

        if (once) {
            this.client.once(discordEventName, handler);
        } else {
            this.client.on(discordEventName, handler);
        }

        this.eventListenerCount++;
    }

    /**
     * Adapter to convert Discord.js Interaction to Interaction domain type
     * @param interaction The Discord.js interaction
     */
    private mapUser(user: DiscordInteraction['user']): Interaction['user'] {
        return {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator === '0' ? undefined : user.discriminator,
            displayName: user.displayName || user.globalName || undefined,
            avatarUrl: user.displayAvatarURL() || undefined,
            isBot: user.bot || false
        };
    }

    private adaptInteraction(interaction: DiscordInteraction): Interaction {
        // Build only the fields declared in the platform Interaction contract.
        const baseInteraction = {
            id: interaction.id,
            user: this.mapUser(interaction.user),
            guildId: interaction.guildId || undefined,
            channelId: interaction.channelId || undefined,
            timestamp: Date.now()
        };

        if (interaction.isChatInputCommand()) {
            return {
                ...baseInteraction,
                type: 'slash',
                commandName: interaction.commandName,
                options: this.adaptCommandOptions(interaction.options),
                subcommand: interaction.options.getSubcommand(false) || undefined,
                subcommandGroup: interaction.options.getSubcommandGroup(false) || undefined
            };
        }

        if (interaction.isUserContextMenuCommand()) {
            return {
                ...baseInteraction,
                type: 'context:user',
                commandName: interaction.commandName,
                targetUser: this.mapUser(interaction.targetUser)
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
                    author: this.mapUser(interaction.targetMessage.author)
                }
            };
        }

        if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
            const componentType = interaction.isButton() ? 'button' :
                interaction.isAnySelectMenu() ? 'select' :
                    'modal';
            const values = 'values' in interaction ? interaction.values : undefined;

            return {
                ...baseInteraction,
                type: 'component',
                customId: interaction.customId,
                values,
                componentType,
                state: {
                    customId: interaction.customId,
                    values,
                    componentType
                }
            };
        }

        if (interaction.isAutocomplete()) {
            const focusedOption = interaction.options.getFocused(true);
            return {
                ...baseInteraction,
                type: 'autocomplete',
                commandName: interaction.commandName,
                focusedOption: {
                    name: focusedOption.name,
                    value: String(focusedOption.value)
                },
                respond: async (choices: Array<{ name: string; value: string }>) => {
                    await interaction.respond(choices);
                    return undefined;
                }
            };
        }

        // Fallback for unknown interaction types
        throw new Error(`Unsupported interaction type: ${interaction.type}`);
    }

    private adaptCommandOptions(options: OptionsResolver): CommandOptions {
        return {
            getString: (name: string) => options.getString(name),
            getInteger: (name: string) => options.getInteger(name),
            getBoolean: (name: string) => options.getBoolean(name),
            getUser: (name: string) => {
                const user = options.getUser(name);
                return user ? this.mapUser(user) : null;
            },
            getChannel: (name: string) => {
                const channel = options.getChannel(name);
                if (!channel) {
                    return null;
                }

                return {
                    id: channel.id,
                    name: 'name' in channel && typeof channel.name === 'string' ? channel.name : 'Unknown',
                    type: channel.type.toString()
                };
            },
            getRole: (name: string) => {
                const role = options.getRole(name);
                if (!role) {
                    return null;
                }

                return {
                    id: role.id,
                    name: role.name,
                    color: 'hexColor' in role && typeof role.hexColor === 'string'
                        ? role.hexColor
                        : undefined
                };
            }
        };
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