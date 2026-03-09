import type { PlatformRegistryReaderInterface } from "app/domain/interface/registry/PlatformRegistryReaderInterface.js";
import type { DescriptorInterface } from "app/domain/interface/registry/DescriptorInterface.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";
import type { CommandRepository } from "app/domain/interface/repository/CommandRepository.js";
import type { PlatformCommand } from "app/domain/types/commands/PlatformCommand.js";

/**
 * Domain service for command registration business logic
 */
export class CommandRegistrationService {
    private readonly commandRepository: CommandRepository;
    private readonly registry: PlatformRegistryReaderInterface;

    constructor(
        commandRepository: CommandRepository,
        registry: PlatformRegistryReaderInterface
    ) {
        this.commandRepository = commandRepository;
        this.registry = registry;
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
     * Build platform command payloads from registry descriptors
     */
    private buildCommandsFromRegistry(): PlatformCommand[] {
        const commandKinds = [
            REGISTRY_KINDS.SLASH,
            REGISTRY_KINDS.CONTEXT_USER,
            REGISTRY_KINDS.CONTEXT_MESSAGE
        ];

        return commandKinds.flatMap(kind =>
            this.registry.list(kind).map(descriptor => this.buildCommand(descriptor))
        );
    }

    /**
     * Build a platform command from descriptor
     */
    private buildCommand(descriptor: DescriptorInterface): PlatformCommand {
        const HandlerClass = descriptor.handlerClass;
        const handler = new HandlerClass();

        return handler.buildCommand();
    }
}
