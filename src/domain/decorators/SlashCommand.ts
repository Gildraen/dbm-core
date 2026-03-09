import type { SlashCommandHandler } from "app/domain/interface/handlers/commands/SlashCommandHandler.js";
import type { SlashCommandMetadata } from "app/domain/types/metadata/SlashCommandMetadata.js";
import { registryProvider } from "app/domain/registry/RegistryProvider.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";
import { Keys } from "app/domain/keys/Keys.js";

/**
 * Decorator for slash commands
 * Automatically registers the decorated class in the global registry
 *
 * @param name The name of the slash command
 * @param description The description of the slash command
 *
 * @example
 * ```typescript
 * @SlashCommand('ping', 'Replies with pong!')
 * export class PingCommand implements SlashCommandHandler {
 *     async handle(interaction: CommandInteraction): Promise<void> {
 *         await interaction.reply?.('Pong!');
 *     }
 * }
 * ```
 */
export function SlashCommand(name: string, description: string) {
    return function <T extends new () => SlashCommandHandler>(target: T): T {
        const metadata: SlashCommandMetadata = {
            name: target.name,
            description: description
        };

        const registry = registryProvider.getRegistry();
        registry.upsert({
            key: Keys.slash(name),
            kind: REGISTRY_KINDS.SLASH,
            metadata: metadata,
            handlerClass: target
        });

        return target;
    };
}
