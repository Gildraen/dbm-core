import type { SlashCommand } from "app/domain/types/DecoratorInterfaces.js";
import { registerSlashCommand } from "app/infrastructure/registry/DiscordRegistry.js";

/**
 * Decorator for Discord slash commands
 * Automatically registers the decorated class in the DiscordRegistry
 *
 * @example
 * ```typescript
 * @SlashCommand
 * export class PingCommand implements SlashCommand {
 *     name = 'ping';
 *     description = 'Replies with pong!';
 *
 *     buildCommand(): SlashCommandBuilder {
 *         return new SlashCommandBuilder()
 *             .setName(this.name)
 *             .setDescription(this.description);
 *     }
 *
 *     async execute(interaction: ChatInputCommandInteraction): Promise<void> {
 *         await interaction.reply('Pong!');
 *     }
 * }
 * ```
 */
export function SlashCommand<T extends new () => SlashCommand>(target: T): T {
    // Register the command class when the decorator is applied
    const instance = new target();
    registerSlashCommand(instance.name, target);

    return target;
}
