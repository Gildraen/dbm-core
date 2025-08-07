import type { ListenerRepository } from "app/domain/interface/ListenerRepository.js";
import { getAllSlashCommands } from "app/infrastructure/registry/DiscordRegistry.js";
import { getAllUserContextMenus } from "app/infrastructure/decorator/UserContextMenu.js";
import { getAllMessageContextMenus } from "app/infrastructure/decorator/MessageContextMenu.js";
import { getAllStringSelectListeners } from "app/infrastructure/decorator/StringSelectListener.js";
import { getAllUserSelectListeners } from "app/infrastructure/decorator/UserSelectListener.js";
import { getAllRoleSelectListeners } from "app/infrastructure/decorator/RoleSelectListener.js";
import { getAllChannelSelectListeners } from "app/infrastructure/decorator/ChannelSelectListener.js";
import { getAllMentionableSelectListeners } from "app/infrastructure/decorator/MentionableSelectListener.js";
import { getAllAutocompleteListeners } from "app/infrastructure/decorator/AutocompleteListener.js";
import { getAllEventListeners } from "app/infrastructure/decorator/EventListener.js";
import type { Client, Interaction } from "discord.js";

/**
 * Interaction handler strategy - defines how each interaction type should be handled
 */
interface InteractionHandler {
    name: string;
    matches: (interaction: Interaction) => boolean;
    getRegistry: () => Map<string, new () => any>;
    getKey: (interaction: any) => string;
    method: 'execute' | 'handle';
}

/**
 * Domain service for listener setup business logic
 * Contains the core logic for registering discovered listeners with Discord
 */
export class ListenerSetupService {
    private readonly listenerRepository: ListenerRepository;
    private readonly client: Client;
    private readonly interactionHandlers: ReadonlyArray<InteractionHandler>;

    constructor(listenerRepository: ListenerRepository, client: Client) {
        this.listenerRepository = listenerRepository;
        this.client = client;
        this.interactionHandlers = this.createInteractionHandlers();
    }

    /**
     * Set up all discovered listeners with the Discord client
     * Returns the total number of listeners registered
     */
    setupDiscoveredListeners(): number {
        let totalListeners = 0;

        // Setup interaction router
        totalListeners += this.setupInteractionRouter();

        // Setup event listeners
        totalListeners += this.setupEventListeners();

        // Log summary
        this.logSetupSummary(totalListeners);

        return totalListeners;
    }

    /**
     * Create interaction handlers with strategy pattern for better organization
     */
    private createInteractionHandlers(): ReadonlyArray<InteractionHandler> {
        return [
            // Command handlers - all use commandName and execute()
            ...this.createCommandHandlers(),

            // Component handlers - all use customId and handle()
            ...this.createComponentHandlers(),

            // Special handlers
            ...this.createSpecialHandlers()
        ] as const;
    }

    private createCommandHandlers(): InteractionHandler[] {
        return [
            {
                name: 'SlashCommand',
                matches: (i) => i.isChatInputCommand(),
                getRegistry: getAllSlashCommands,
                getKey: (i) => i.commandName,
                method: 'execute'
            },
            {
                name: 'UserContextMenu',
                matches: (i) => i.isUserContextMenuCommand(),
                getRegistry: getAllUserContextMenus,
                getKey: (i) => i.commandName,
                method: 'execute'
            },
            {
                name: 'MessageContextMenu',
                matches: (i) => i.isMessageContextMenuCommand(),
                getRegistry: getAllMessageContextMenus,
                getKey: (i) => i.commandName,
                method: 'execute'
            }
        ];
    }

    private createComponentHandlers(): InteractionHandler[] {
        return [
            {
                name: 'StringSelect',
                matches: (i) => i.isStringSelectMenu(),
                getRegistry: getAllStringSelectListeners,
                getKey: (i) => i.customId,
                method: 'handle'
            },
            {
                name: 'UserSelect',
                matches: (i) => i.isUserSelectMenu(),
                getRegistry: getAllUserSelectListeners,
                getKey: (i) => i.customId,
                method: 'handle'
            },
            {
                name: 'RoleSelect',
                matches: (i) => i.isRoleSelectMenu(),
                getRegistry: getAllRoleSelectListeners,
                getKey: (i) => i.customId,
                method: 'handle'
            },
            {
                name: 'ChannelSelect',
                matches: (i) => i.isChannelSelectMenu(),
                getRegistry: getAllChannelSelectListeners,
                getKey: (i) => i.customId,
                method: 'handle'
            },
            {
                name: 'MentionableSelect',
                matches: (i) => i.isMentionableSelectMenu(),
                getRegistry: getAllMentionableSelectListeners,
                getKey: (i) => i.customId,
                method: 'handle'
            }
        ];
    }

    private createSpecialHandlers(): InteractionHandler[] {
        return [
            {
                name: 'Autocomplete',
                matches: (i) => i.isAutocomplete(),
                getRegistry: getAllAutocompleteListeners,
                getKey: (i) => i.commandName,
                method: 'handle'
            }
        ];
    }

    private setupInteractionRouter(): number {
        this.listenerRepository.registerInteractionListener(
            (interaction: Interaction) => this.handleIncomingInteraction(interaction)
        );

        // Return total count using strategy pattern
        return this.calculateInteractionListenerCount();
    }

    private async handleIncomingInteraction(interaction: Interaction): Promise<undefined> {
        const startTime = performance.now();

        try {
            // Find the first matching handler using strategy pattern
            const handler = this.findMatchingHandler(interaction);

            if (handler) {
                const success = await this.executeHandler(interaction, handler);
                const duration = performance.now() - startTime;

                if (success) {
                    console.debug(`✅ ${handler.name} handled in ${duration.toFixed(2)}ms`);
                    return;
                }
            }

            // Log unhandled interactions with more detail
            console.warn(`❌ Unhandled ${this.getInteractionTypeName(interaction)}: ${this.getInteractionIdentifier(interaction)}`);

        } catch (error) {
            const duration = performance.now() - startTime;
            console.error(`💥 Interaction error after ${duration.toFixed(2)}ms:`, {
                type: this.getInteractionTypeName(interaction),
                identifier: this.getInteractionIdentifier(interaction),
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    private findMatchingHandler(interaction: Interaction): InteractionHandler | undefined {
        // Use find for early termination - more efficient than loop
        return this.interactionHandlers.find(handler => handler.matches(interaction));
    }

    private async executeHandler(interaction: Interaction, handler: InteractionHandler): Promise<boolean> {
        try {
            const key = handler.getKey(interaction as any);
            const registry = handler.getRegistry();
            const HandlerClass = registry.get(key);

            if (!HandlerClass) {
                console.debug(`No handler found for ${handler.name} with key: ${key}`);
                return false;
            }

            const instance = new HandlerClass();

            if (handler.method === 'execute') {
                await (instance as any).execute(interaction);
            } else {
                await (instance as any).handle(interaction);
            }

            return true;
        } catch (error) {
            console.error(`Error in ${handler.name} handler:`, error);
            return false;
        }
    }

    private calculateInteractionListenerCount(): number {
        return this.interactionHandlers.reduce((total, handler) => {
            try {
                return total + handler.getRegistry().size;
            } catch (error) {
                console.warn(`Error counting ${handler.name} handlers:`, error);
                return total;
            }
        }, 0);
    }

    private getInteractionTypeName(interaction: Interaction): string {
        if (interaction.isChatInputCommand()) return 'SlashCommand';
        if (interaction.isUserContextMenuCommand()) return 'UserContextMenu';
        if (interaction.isMessageContextMenuCommand()) return 'MessageContextMenu';
        if (interaction.isButton()) return 'Button';
        if (interaction.isStringSelectMenu()) return 'StringSelect';
        if (interaction.isUserSelectMenu()) return 'UserSelect';
        if (interaction.isRoleSelectMenu()) return 'RoleSelect';
        if (interaction.isChannelSelectMenu()) return 'ChannelSelect';
        if (interaction.isMentionableSelectMenu()) return 'MentionableSelect';
        if (interaction.isAutocomplete()) return 'Autocomplete';
        if (interaction.isModalSubmit()) return 'ModalSubmit';
        return `Unknown(${interaction.type})`;
    }

    private getInteractionIdentifier(interaction: Interaction): string {
        if (interaction.isCommand()) return interaction.commandName;
        if (interaction.isMessageComponent()) return interaction.customId;
        if (interaction.isAutocomplete()) return interaction.commandName;
        if (interaction.isModalSubmit()) return interaction.customId;
        return 'unknown';
    }

    private setupEventListeners(): number {
        let eventListenerCount = 0;
        const eventHandlers = getAllEventListeners();

        for (const [eventName, handlerList] of eventHandlers) {
            for (const { handlerClass, once } of handlerList) {
                const instance = new handlerClass();

                this.listenerRepository.registerEventListener(
                    eventName as any,
                    async (...args: any[]) => instance.handle(this.client, ...args),
                    once
                );
                eventListenerCount++;
            }
        }

        return eventListenerCount;
    }

    private logSetupSummary(totalListeners: number): void {
        const interactionCount = this.calculateInteractionListenerCount();
        const eventHandlers = getAllEventListeners().size;

        console.log(`✅ Successfully set up ${totalListeners} discovered listeners with Discord client:`);

        // Log interaction handlers by category
        this.interactionHandlers.forEach(handler => {
            const count = handler.getRegistry().size;
            if (count > 0) {
                console.log(`   - ${handler.name}: ${count}`);
            }
        });

        console.log(`   - Event listeners: ${eventHandlers}`);

        const performanceInfo = totalListeners > 50 ? ' (Consider optimizing for large-scale deployments)' : '';
        console.log(`📊 Total interaction handlers: ${interactionCount}${performanceInfo}`);
    }
}
