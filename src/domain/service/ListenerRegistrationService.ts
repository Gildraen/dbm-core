import type { ListenerRepository } from "app/domain/interface/repository/ListenerRepository.js";
import type { Interaction } from "app/domain/interface/InteractionHandler.js";
import type { PlatformRegistryReaderInterface } from "app/domain/interface/registry/PlatformRegistryReaderInterface.js";
import type { DescriptorInterface } from "app/domain/interface/registry/DescriptorInterface.js";
import type { Kind } from "app/domain/interface/registry/types.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";
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
        const failures: RegistrationFailure[] = [];
        let attachedInteractionRouter = 0;
        let attachedEventListeners = 0;

        // Register interaction router
        try {
            attachedInteractionRouter = this.registerInteractionRouter();
        } catch (error) {
            failures.push({
                target: 'interaction-router',
                message: this.formatErrorMessage(error)
            });
        }

        // Register event listeners
        attachedEventListeners = this.registerEventListeners(failures);

        const totalListeners = attachedInteractionRouter + attachedEventListeners;

        // Log summary
        this.logRegisterSummary(totalListeners, attachedInteractionRouter, attachedEventListeners, failures);

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
    private registerEventListeners(failures: RegistrationFailure[]): number {
        const eventDescriptors = this.registry.list(REGISTRY_KINDS.EVENT);
        let registeredEventListeners = 0;

        for (const descriptor of eventDescriptors) {
            try {
                this.registerEventListener(descriptor);

                registeredEventListeners += 1;
            } catch (error) {
                failures.push({
                    target: `event-listener:${descriptor.key}`,
                    message: this.formatErrorMessage(error)
                });
            }
        }

        return registeredEventListeners;
    }

    private registerEventListener(descriptor: DescriptorInterface<typeof REGISTRY_KINDS.EVENT>): void {
        const eventName = this.extractEventName(descriptor.key);
        const once = descriptor.metadata.once;

        this.listenerRepository.registerEventHandlerClass(
            eventName,
            descriptor.handlerClass,
            once
        );
    }

    /**
     * Route platform interaction to appropriate handler
     */
    private async routeInteraction(interaction: Interaction): Promise<unknown> {
        try {
            const key = this.getInteractionKey(interaction);
            let descriptor = this.registry.get(key);

            // For autocomplete, fall back to the base command key (without option suffix)
            // so that @Autocomplete('cmd') handlers catch all options of that command
            if (!descriptor && interaction.type === 'autocomplete' && interaction.commandName) {
                const fallbackKey = Keys.autocomplete(Keys.slash(interaction.commandName));
                descriptor = this.registry.get(fallbackKey);
            }

            if (!descriptor) {
                console.warn(`⚠️  No handler found for interaction key: ${key}`);
                return;
            }

            await this.executeHandler(descriptor, interaction);

        } catch (error) {
            console.error(`❌ Error handling interaction:`, error);
            await this.handleInteractionError(interaction, error);
        }
    }

    /**
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
                const customId = interaction.customId ?? interaction.state?.customId;
                if (typeof customId !== 'string') {
                    throw new Error('customId must be a string');
                }
                const namespace = this.componentNamespaceFromType(interaction.componentType ?? interaction.state?.componentType);
                if (namespace) {
                    const namespacedKey = Keys.component({ namespace, id: customId });
                    // Backward-compatibility: fall back to legacy key when only old registrations exist.
                    return this.registry.has(namespacedKey)
                        ? namespacedKey
                        : Keys.component({ id: customId });
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
    private logRegisterSummary(
        totalListeners: number,
        attachedInteractionRouter: number,
        attachedEventListeners: number,
        failures: RegistrationFailure[]
    ): void {
        const summary = this.registry.size();
        const discoveredEventListeners = this.registry.size(REGISTRY_KINDS.EVENT);
        const discoveredInteractionHandlers = summary - discoveredEventListeners;

        console.log(`✅ Attached ${totalListeners} runtime listeners:`);
        console.log(`   - ${attachedEventListeners} event listeners`);
        console.log(`   - ${attachedInteractionRouter} interaction router`);
        console.log(`ℹ️  Discovered ${discoveredEventListeners} event listeners in registry`);
        console.log(`ℹ️  Discovered ${discoveredInteractionHandlers} interaction handlers in registry`);

        if (failures.length > 0) {
            console.error(`❌ Encountered ${failures.length} listener registration error(s):`);
            for (const failure of failures) {
                console.error(`   - ${failure.target}: ${failure.message}`);
            }
        }
    }

    private formatErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }

    private componentNamespaceFromType(componentType?: string): string | undefined {
        switch (componentType) {
            case 'string-select':
            case 'user-select':
            case 'role-select':
            case 'channel-select':
            case 'mentionable-select':
            case 'button':
            case 'modal':
                return componentType;
            default:
                return undefined;
        }
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
            this.registry.size(REGISTRY_KINDS.STRING_SELECT) +
            this.registry.size(REGISTRY_KINDS.USER_SELECT) +
            this.registry.size(REGISTRY_KINDS.ROLE_SELECT) +
            this.registry.size(REGISTRY_KINDS.CHANNEL_SELECT) +
            this.registry.size(REGISTRY_KINDS.MENTIONABLE_SELECT) +
            this.registry.size(REGISTRY_KINDS.BUTTON) +
            this.registry.size(REGISTRY_KINDS.MODAL);

        return {
            events: this.registry.size(REGISTRY_KINDS.EVENT),
            slashCommands: this.registry.size(REGISTRY_KINDS.SLASH),
            contextMenus: this.registry.size(REGISTRY_KINDS.CONTEXT_USER) + this.registry.size(REGISTRY_KINDS.CONTEXT_MESSAGE),
            components: componentCount,
            autocomplete: this.registry.size(REGISTRY_KINDS.AUTOCOMPLETE),
            total: this.registry.size()
        };
    }
}

type RegistrationFailure = {
    target: string;
    message: string;
};
