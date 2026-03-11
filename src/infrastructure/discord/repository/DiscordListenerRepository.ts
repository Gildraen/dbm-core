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