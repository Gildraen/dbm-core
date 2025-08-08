import type { Client, ClientEvents, Interaction } from "discord.js";
import type { ListenerRepository } from "app/domain/interface/ListenerRepository.js";
import type { PlatformInteraction } from "app/domain/interface/InteractionHandler.js";
import { DiscordPlatformAdapter } from "app/infrastructure/adapter/DiscordPlatformAdapter.js";

/**
 * Discord client implementation of ListenerRepository
 * Handles registration of event listeners with the Discord client
 * Mapping between domain abstractions and Discord.js types
 */
export class DiscordListenerRepository implements ListenerRepository {
    private readonly client: Client;
    private readonly adapter: DiscordPlatformAdapter;
    private eventListenerCount = 0;
    private interactionListenerCount = 0;

    constructor(client: Client) {
        this.client = client;
        this.adapter = new DiscordPlatformAdapter();
    }

    registerEventListener(
        eventName: string,
        handler: (...args: unknown[]) => Promise<unknown>,
        once: boolean = false
    ): void {
        // Type assertion for Discord.js event types
        const discordEventName = eventName as keyof ClientEvents;
        const typedHandler = handler as (...args: any[]) => Promise<unknown>;

        if (once) {
            this.client.once(discordEventName, typedHandler);
        } else {
            this.client.on(discordEventName, typedHandler);
        }
        this.eventListenerCount++;
    }

    registerEventHandlerClass(
        eventName: string,
        handlerClass: new () => { handle: (...args: unknown[]) => Promise<unknown> },
        once: boolean = false
    ): void {
        // Type assertion for Discord.js event types
        const discordEventName = eventName as keyof ClientEvents;
        const instance = new handlerClass();

        // Create handler that adapts Discord.js types to platform-agnostic types
        const handler = async (...args: any[]) => {
            // Adapt the event arguments to platform-agnostic types
            const adaptedArgs = this.adapter.adaptEventArgs(eventName, args);
            return instance.handle(...adaptedArgs);
        };

        if (once) {
            this.client.once(discordEventName, handler);
        } else {
            this.client.on(discordEventName, handler);
        }
        this.eventListenerCount++;
    }

    /**
     * Adapter to convert Discord.js Interaction to PlatformInteraction domain type
     * @param interaction The Discord.js interaction
     */
    private adaptInteraction(interaction: Interaction): PlatformInteraction {
        // Create a domain-friendly interaction object without exposing Discord.js internals
        return {
            type: interaction.type,
            id: interaction.id,
            customId: 'customId' in interaction ? interaction.customId : undefined,
            commandName: 'commandName' in interaction ? interaction.commandName : undefined,

            // Type guards - mapping Discord.js methods to our domain interface
            isChatInputCommand: () => interaction.isChatInputCommand(),
            isUserContextMenuCommand: () => interaction.isUserContextMenuCommand(),
            isMessageContextMenuCommand: () => interaction.isMessageContextMenuCommand(),
            isButton: () => 'isButton' in interaction && interaction.isButton(),
            isStringSelectMenu: () => 'isStringSelectMenu' in interaction && interaction.isStringSelectMenu(),
            isUserSelectMenu: () => 'isUserSelectMenu' in interaction && interaction.isUserSelectMenu(),
            isRoleSelectMenu: () => 'isRoleSelectMenu' in interaction && interaction.isRoleSelectMenu(),
            isChannelSelectMenu: () => 'isChannelSelectMenu' in interaction && interaction.isChannelSelectMenu(),
            isMentionableSelectMenu: () => 'isMentionableSelectMenu' in interaction && interaction.isMentionableSelectMenu(),
            isAutocomplete: () => interaction.isAutocomplete(),
            isModalSubmit: () => interaction.isModalSubmit(),
            isCommand: () => interaction.isCommand(),
            isMessageComponent: () => interaction.isMessageComponent()
        };
    }

    registerInteractionListener(
        handler: (interaction: PlatformInteraction) => Promise<unknown>
    ): void {
        // Create adapter that converts Discord.js interaction to domain type
        const adaptedHandler = async (interaction: Interaction) => {
            const domainInteraction = this.adaptInteraction(interaction);
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
