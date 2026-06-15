import type { ListenerRepository } from "app/domain/interface/repository/ListenerRepository.js";
import type { Interaction } from "app/domain/interface/InteractionHandler.js";
import type { EventDescriptorInterface, InteractionDescriptorInterface } from "app/domain/interface/registry/DescriptorInterface.js";
import { isEventDescriptor } from "app/domain/interface/registry/DescriptorInterface.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";
import { Keys } from "app/domain/keys/Keys.js";
import type { RegistryInterface } from "app/domain/interface/registry/RegistryInterface.js";

/**
 * Domain service for listener setup business logic
 */

export class ListenerRegistrationService {
    private readonly listenerRepository: ListenerRepository;
    private readonly registry: RegistryInterface;

    constructor(listenerRepository: ListenerRepository, registry: RegistryInterface) {
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
        this.listenerRepository.registerInteractionListener(async (interaction: Interaction) => {
            await this.routeInteraction(interaction);
        });

        return 1;
    }

    /**
     * Register all event listeners discovered in registry
     */
    private registerEventListeners(failures: RegistrationFailure[]): number {
        const eventDescriptors = this.registry.list(REGISTRY_KINDS.EVENT).filter(isEventDescriptor);
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

    private registerEventListener(descriptor: EventDescriptorInterface): void {
        const eventName = this.extractEventName(descriptor.key);
        const once = descriptor.metadata.once as boolean | undefined;

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
            const { key, descriptor } = this.resolveInteractionDescriptor(interaction);

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
                return Keys.slash(
                    this.requireCommandName(interaction, 'slash'),
                    interaction.subcommandGroup,
                    interaction.subcommand
                );

            case 'context:user':
                return Keys.contextUser(this.requireCommandName(interaction, 'context user'));

            case 'context:message':
                return Keys.contextMessage(this.requireCommandName(interaction, 'context message'));

            case 'component':
                return this.getComponentInteractionKey(interaction);

            case 'autocomplete':
                if (!interaction.focusedOption) {
                    throw new Error('Focused option required for autocomplete interaction');
                }
                return Keys.autocomplete(
                    Keys.slash(this.requireCommandName(interaction, 'autocomplete')),
                    interaction.focusedOption.name
                );

            default:
                const unknownType = interaction.type || 'unknown';
                throw new Error(`Unsupported interaction type: ${unknownType}`);
        }
    }

    private resolveInteractionDescriptor(
        interaction: Interaction
    ): { key: string; descriptor: InteractionDescriptorInterface | undefined } {
        const key = this.getInteractionKey(interaction);
        const descriptor = this.lookupInteractionDescriptor(key, interaction);
        return { key, descriptor };
    }

    private lookupInteractionDescriptor(
        key: string,
        interaction: Interaction
    ): InteractionDescriptorInterface | undefined {
        const descriptor = this.registry.get(key);
        if (descriptor && !isEventDescriptor(descriptor)) {
            return descriptor;
        }

        // For autocomplete, fall back to the base command key (without option suffix)
        // so that @Autocomplete('cmd') handlers catch all options of that command
        if (interaction.type !== 'autocomplete' || !interaction.commandName) {
            return undefined;
        }

        const fallbackKey = Keys.autocomplete(Keys.slash(interaction.commandName));
        const fallback = this.registry.get(fallbackKey);
        return fallback && !isEventDescriptor(fallback) ? fallback : undefined;
    }

    private getComponentInteractionKey(interaction: Interaction): string {
        const customId = interaction.customId ?? interaction.state?.customId;
        if (typeof customId !== 'string') {
            throw new Error('customId must be a string');
        }

        const namespace = this.componentNamespaceFromType(
            interaction.componentType ?? interaction.state?.componentType
        );

        if (!namespace) {
            return Keys.component({ id: customId });
        }

        const namespacedKey = Keys.component({ namespace, id: customId });
        // Backward-compatibility: fall back to legacy key when only old registrations exist.
        return this.registry.has(namespacedKey)
            ? namespacedKey
            : Keys.component({ id: customId });
    }

    private requireCommandName(interaction: Interaction, interactionKind: string): string {
        if (!interaction.commandName) {
            throw new Error(`Command name required for ${interactionKind} interaction`);
        }

        return interaction.commandName;
    }

    private async executeHandler(
        descriptor: InteractionDescriptorInterface,
        interaction: Interaction
    ): Promise<unknown> {
        const handler = new descriptor.handlerClass();
        return handler.handle(interaction);
    }

    /**
     * Extract event name from registry key
     */
    private extractEventName(key: string): string {
        const parsed = Keys.parseKey(key);
        if (!parsed || parsed.type !== 'evt') {
            throw new Error(`Invalid event key: ${key}`);
        }

        return parsed.parts.join('.');
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
