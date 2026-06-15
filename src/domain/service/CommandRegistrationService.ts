import { REGISTRY_KINDS, type CommandKind } from "app/domain/interface/registry/types.js";
import type { CommandRepository } from "app/domain/interface/repository/CommandRepository.js";
import type { CommandHandlerInterface } from "app/domain/interface/handlers/HandlerInterface.js";
import type { InteractionDescriptorInterface } from "app/domain/interface/registry/DescriptorInterface.js";
import { isEventDescriptor } from "app/domain/interface/registry/DescriptorInterface.js";
import { registry } from "app/domain/registry/RegistryProvider.js";

/**
 * Domain service for command registration business logic
 */
export class CommandRegistrationService {
    private readonly commandRepository: CommandRepository;

    constructor(commandRepository: CommandRepository) {
        this.commandRepository = commandRepository;
    }

    /**
     * Register all discovered commands with the platform
     */
    async registerDiscoveredCommands(): Promise<number> {
        const commands = this.buildCommandsFromRegistry();

        if (commands.length === 0) {
            console.log("ℹ️  No commands discovered for registration");
            return 0;
        }

        const registeredCount = await this.commandRepository.registerCommands(commands);

        console.log(registeredCount === commands.length
            ? `✅ Successfully registered all ${registeredCount} commands`
            : `⚠️  Registered ${registeredCount}/${commands.length} commands`
        );

        return registeredCount;
    }

    /**
     * Build command payloads from registry descriptors
     */
    private buildCommandsFromRegistry(): Record<string, unknown>[] {
        const commandKinds: CommandKind[] = [
            REGISTRY_KINDS.SLASH,
            REGISTRY_KINDS.CONTEXT_USER,
            REGISTRY_KINDS.CONTEXT_MESSAGE
        ];

        return commandKinds.flatMap(kind =>
            registry.list(kind)
                .filter((d): d is InteractionDescriptorInterface => !isEventDescriptor(d))
                .map(descriptor => {
                    const handler = new descriptor.handlerClass() as CommandHandlerInterface;
                    return handler.buildCommand();
                })
        );
    }
}
