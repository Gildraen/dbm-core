import type { Client, ClientEvents, Interaction as DiscordInteraction, CommandInteractionOptionResolver } from "discord.js";
import type { ListenerRepository } from "app/domain/interface/repository/ListenerRepository.js";
import type { Interaction } from "app/domain/interface/InteractionHandler.js";

type OptionsResolver = Pick<
    CommandInteractionOptionResolver,
    'getString' | 'getInteger' | 'getBoolean' | 'getUser' | 'getChannel' | 'getRole'
>;

/**
 * Discord client implementation of ListenerRepository
 */
export class DiscordListenerRepository implements ListenerRepository {
    private readonly client: Client;
    private eventListenerCount = 0;
    private interactionListenerCount = 0;

    constructor(client: Client) {
        this.client = client;
    }

    registerEventListener<K extends keyof ClientEvents>(
        eventName: K,
        handler: (...args: ClientEvents[K]) => Promise<unknown>,
        once?: boolean
    ): void;
    registerEventListener(
        eventName: string,
        handler: (...args: unknown[]) => Promise<unknown>,
        once?: boolean
    ): void;
    registerEventListener(
        eventName: string,
        handler: (...args: unknown[]) => Promise<unknown>,
        once = false
    ): void {
        if (once) {
            this.client.once(eventName as keyof ClientEvents, handler as (...args: ClientEvents[keyof ClientEvents]) => void);
        } else {
            this.client.on(eventName as keyof ClientEvents, handler as (...args: ClientEvents[keyof ClientEvents]) => void);
        }

        this.eventListenerCount++;
    }

    registerEventHandlerClass<K extends keyof ClientEvents>(
        eventName: K,
        handlerClass: new () => { handle: (...args: ClientEvents[K]) => Promise<unknown> },
        once?: boolean
    ): void;
    registerEventHandlerClass(
        eventName: string,
        handlerClass: new () => { handle: (...args: unknown[]) => Promise<unknown> },
        once?: boolean
    ): void;
    registerEventHandlerClass(
        eventName: string,
        handlerClass: new () => { handle: (...args: unknown[]) => Promise<unknown> },
        once = false
    ): void {
        const instance = new handlerClass();
        const handler = (...args: unknown[]) => instance.handle(...args);

        if (once) {
            this.client.once(eventName as keyof ClientEvents, handler as (...args: ClientEvents[keyof ClientEvents]) => void);
        } else {
            this.client.on(eventName as keyof ClientEvents, handler as (...args: ClientEvents[keyof ClientEvents]) => void);
        }

        this.eventListenerCount++;
    }

    private adaptInteraction(interaction: DiscordInteraction): Interaction {
        const base = {
            id: interaction.id,
            userId: interaction.user.id,
            guildId: interaction.guildId || undefined,
            channelId: interaction.channelId || undefined,
        };

        if (interaction.isChatInputCommand()) {
            return {
                ...base,
                type: 'slash',
                commandName: interaction.commandName,
                options: this.adaptCommandOptions(interaction.options),
                subcommand: interaction.options.getSubcommand(false) || undefined,
                subcommandGroup: interaction.options.getSubcommandGroup(false) || undefined,
                reply: async (content) => { await interaction.reply(content as never); },
                followUp: async (content) => { await interaction.followUp(content as never); },
                deferReply: async (options) => { await interaction.deferReply(options as never); },
            };
        }

        if (interaction.isUserContextMenuCommand()) {
            return {
                ...base,
                type: 'context:user',
                commandName: interaction.commandName,
                reply: async (content) => { await interaction.reply(content as never); },
                followUp: async (content) => { await interaction.followUp(content as never); },
            };
        }

        if (interaction.isMessageContextMenuCommand()) {
            return {
                ...base,
                type: 'context:message',
                commandName: interaction.commandName,
                reply: async (content) => { await interaction.reply(content as never); },
                followUp: async (content) => { await interaction.followUp(content as never); },
            };
        }

        if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
            const componentType = interaction.isButton() ? 'button' :
                interaction.isStringSelectMenu() ? 'string-select' :
                    interaction.isUserSelectMenu() ? 'user-select' :
                        interaction.isRoleSelectMenu() ? 'role-select' :
                            interaction.isChannelSelectMenu() ? 'channel-select' :
                                interaction.isMentionableSelectMenu() ? 'mentionable-select' :
                                    'modal';
            const values = 'values' in interaction ? interaction.values : undefined;

            return {
                ...base,
                type: 'component',
                customId: interaction.customId,
                values,
                componentType,
                state: { customId: interaction.customId, values, componentType },
                reply: async (content) => { await interaction.reply(content as never); },
                followUp: async (content) => { await interaction.followUp(content as never); },
                deferReply: async (options) => { await interaction.deferReply(options as never); },
            };
        }

        if (interaction.isAutocomplete()) {
            const focusedOption = interaction.options.getFocused(true);
            return {
                ...base,
                type: 'autocomplete',
                commandName: interaction.commandName,
                focusedOption: {
                    name: focusedOption.name,
                    value: String(focusedOption.value)
                },
                respond: async (choices) => {
                    await interaction.respond(choices);
                },
            };
        }

        throw new Error(`Unsupported interaction type: ${interaction.type}`);
    }

    private adaptCommandOptions(options: OptionsResolver): Record<string, unknown> {
        return {
            getString: (name: string) => options.getString(name),
            getInteger: (name: string) => options.getInteger(name),
            getBoolean: (name: string) => options.getBoolean(name),
            getUser: (name: string) => {
                const user = options.getUser(name);
                return user ? { id: user.id, username: user.username } : null;
            },
            getChannel: (name: string) => {
                const channel = options.getChannel(name);
                if (!channel) return null;
                return {
                    id: channel.id,
                    name: 'name' in channel && typeof channel.name === 'string' ? channel.name : 'Unknown',
                    type: channel.type.toString()
                };
            },
            getRole: (name: string) => {
                const role = options.getRole(name);
                if (!role) return null;
                return {
                    id: role.id,
                    name: role.name,
                    color: 'hexColor' in role && typeof role.hexColor === 'string' ? role.hexColor : undefined
                };
            }
        };
    }

    registerInteractionListener(
        handler: (interaction: Interaction) => Promise<unknown>
    ): void {
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
