import type { ListenerRepository } from "app/domain/interface/repository/ListenerRepository.js";
import type { Interaction } from "app/domain/interface/InteractionHandler.js";
import type { PlatformRegistryReaderInterface } from "app/domain/interface/registry/PlatformRegistryReaderInterface.js";
import type { DescriptorInterface } from "app/domain/interface/registry/DescriptorInterface.js";
import type { Kind, KindHandleArgsMap } from "app/domain/interface/registry/types.js";
import { Keys } from "app/domain/keys/Keys.js";
import type { PlatformEventKey } from "app/domain/types/events/PlatformEventKey.js";

/**
 * Domain service for listener setup business logic
 * Contains the core logic for registering discovered listeners with the platform
 * Now fully platform-agnostic using the neutral registry
 */

export class ListenerRegistrationService {
    private readonly listenerRepository: ListenerRepository;
    private readonly registry: PlatformRegistryReaderInterface;

    constructor(
        listenerRepository: ListenerRepository,
        registry: PlatformRegistryReaderInterface
    ) {
        this.listenerRepository = listenerRepository;
        this.registry = registry;
    }

    /**
     * Register all discovered listeners with the platform client
     * Returns the total number of listeners registered
     */
    registerDiscoveredListeners(): number {
        let totalListeners = 0;

        // Register interaction router
        totalListeners += this.registerInteractionRouter();

        // Register event listeners
        totalListeners += this.registerEventListeners();

        // Log summary
        this.logRegisterSummary(totalListeners);

        return totalListeners;
    }

    /**
     * Register the main interaction router that routes all interactions
     */
    private registerInteractionRouter(): number {
        this.listenerRepository.registerInteractionListener(
            async (interaction: Interaction) => {
                await this.routeInteraction(interaction);
            }
        );
        return 1;
    }

    /**
     * Register all event listeners discovered in registry
     */
    private registerEventListeners(): number {
        const eventDescriptors = this.registry.list('event');

        for (const descriptor of eventDescriptors) {
            const eventName = this.extractEventName(descriptor.key);

            // Type system now knows descriptor.handlerClass returns EventHandler with handle method
            this.listenerRepository.registerEventHandlerClass(
                eventName,
                descriptor.handlerClass
            );
        }

        return eventDescriptors.length;
    }

    /**
     * Route platform interaction to appropriate handler
     */
    private async routeInteraction(interaction: Interaction): Promise<unknown> {
        try {
            const key = this.getInteractionKey(interaction);
            const descriptor = this.registry.get(key);

            if (!descriptor) {
                console.warn(`⚠️  No handler found for interaction key: ${key}`);
                return;
            }

            await this.executeHandler(descriptor, interaction);

        } catch (error) {
            console.error(`❌ Error handling interaction:`, error);
            await this.handleInteractionError(interaction, error);
        }
    }    /**
     * Get registry key for platform interaction
     */
    private getInteractionKey(interaction: Interaction): string {
        switch (interaction.type) {
            case 'slash':
                if (!interaction.commandName) throw new Error('Command name required for slash interaction');
                return Keys.slash(
                    interaction.commandName,
                    interaction.subcommandGroup,
                    interaction.subcommand
                );

            case 'context:user':
                if (!interaction.commandName) throw new Error('Command name required for context user interaction');
                return Keys.contextUser(interaction.commandName);

            case 'context:message':
                if (!interaction.commandName) throw new Error('Command name required for context message interaction');
                return Keys.contextMessage(interaction.commandName);

            case 'component':
                if (!interaction.state || typeof interaction.state !== 'object' || !('customId' in interaction.state)) {
                    throw new Error('State with customId required for component interaction');
                }
                const customId = interaction.state.customId;
                if (typeof customId !== 'string') {
                    throw new Error('customId must be a string');
                }
                return Keys.component({ id: customId });

            case 'autocomplete':
                if (!interaction.commandName) throw new Error('Command name required for autocomplete interaction');
                if (!interaction.focusedOption) throw new Error('Focused option required for autocomplete interaction');
                return Keys.autocomplete(
                    Keys.slash(interaction.commandName),
                    interaction.focusedOption.name
                );

            default:
                const unknownType = interaction.type || 'unknown';
                throw new Error(`Unsupported interaction type: ${unknownType}`);
        }
    }

    /**
     * Execute handler for interaction using the standard handle method
     * Type-safe execution using generic K to ensure interaction type matches handler
     *
     * Note: Cast is necessary because TypeScript can't statically prove that the runtime
     * interaction type matches the handler's expected type, even though we ensure this
     * through the registry lookup by interaction key.
     */
    private async executeHandler<K extends Kind>(
        descriptor: DescriptorInterface<K>,
        interaction: Interaction
    ): Promise<unknown> {
        const HandlerClass = descriptor.handlerClass;
        const handler = new HandlerClass();

        // Runtime guarantee: interaction type matches handler because we looked up
        // the handler using a key derived from the interaction type
        return handler.handle(interaction as any);
    }

    /**
     * Extract event name from registry key
     */
    private extractEventName(key: string): PlatformEventKey {
        const parsed = Keys.parseKey(key);
        if (!parsed || parsed.type !== 'evt') {
            throw new Error(`Invalid event key: ${key}`);
        }

        // Event keys are created through typed decorators (@Event), so this cast
        // reflects the compile-time contract already enforced at registration.
        return parsed.parts.join('.') as PlatformEventKey;
    }

    /**
     * Handle interaction execution error
     */
    private async handleInteractionError(interaction: Interaction, error: unknown): Promise<unknown> {
        console.error(`Failed to handle ${interaction.type} interaction:`, error);
        // Additional error handling can be implemented here
        // e.g., sending error responses to users
        return undefined;
    }

    /**
     * Log registration summary
     */
    private logRegisterSummary(totalListeners: number): void {
        const summary = this.registry.size();
        const eventCount = this.registry.size('event');
        const interactionCount = summary - eventCount;

        console.log(`✅ Registered ${totalListeners} listeners:`);
        console.log(`   - ${eventCount} event listeners`);
        console.log(`   - ${interactionCount} interaction handlers`);
        console.log(`   - 1 interaction router`);
    }

    /**
     * Get summary of registered listeners without executing registration
     */
    getRegistrationSummary(): {
        events: number;
        slashCommands: number;
        contextMenus: number;
        components: number;
        autocomplete: number;
        total: number;
    } {
        // Sum all component kinds
        const componentCount =
            this.registry.size('component:string-select') +
            this.registry.size('component:user-select') +
            this.registry.size('component:role-select') +
            this.registry.size('component:channel-select') +
            this.registry.size('component:mentionable-select') +
            this.registry.size('component:button') +
            this.registry.size('component:modal');

        return {
            events: this.registry.size('event'),
            slashCommands: this.registry.size('slash'),
            contextMenus: this.registry.size('context:user') + this.registry.size('context:message'),
            components: componentCount,
            autocomplete: this.registry.size('autocomplete'),
            total: this.registry.size()
        };
    }
}
