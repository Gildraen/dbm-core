import { getAllSlashCommands } from "app/infrastructure/registry/DiscordRegistry.js";
import { getAllUserContextMenus } from "app/infrastructure/decorator/UserContextMenu.js";
import { getAllMessageContextMenus } from "app/infrastructure/decorator/MessageContextMenu.js";
import type { CommandRepository } from "app/domain/interface/CommandRepository.js";

/**
 * Domain service for command registration business logic
 * Contains the core logic for discovering and registering Discord commands
 */
export class CommandRegistrationService {
    private readonly commandRepository: CommandRepository;

    constructor(commandRepository: CommandRepository) {
        this.commandRepository = commandRepository;
    }

    /**
     * Register all discovered commands with Discord
     * Returns the number of commands registered
     */
    async registerDiscoveredCommands(): Promise<number> {
        const commands = this.buildCommandsFromRegistry();

        if (commands.length === 0) {
            console.log("ℹ️  No commands discovered for Discord registration");
            return 0;
        }

        // Register with Discord
        const registeredCount = await this.commandRepository.registerCommands(commands);

        this.logRegistrationSummary(registeredCount, commands.length);

        return registeredCount;
    }

    /**
     * Get summary of discovered commands without registering them
     * Used for dry-run scenarios
     */
    getDiscoveredCommandsSummary(): { total: number; slashCommands: number; userContextMenus: number; messageContextMenus: number } {
        const slashCommands = getAllSlashCommands();
        const userContextMenus = getAllUserContextMenus();
        const messageContextMenus = getAllMessageContextMenus();

        return {
            total: slashCommands.size + userContextMenus.size + messageContextMenus.size,
            slashCommands: slashCommands.size,
            userContextMenus: userContextMenus.size,
            messageContextMenus: messageContextMenus.size
        };
    }

    /**
     * Log dry-run summary without actually registering commands
     */
    logDryRunSummary(): void {
        const summary = this.getDiscoveredCommandsSummary();

        console.log(`🔍 [DRY RUN] Would register ${summary.total} discovered commands with Discord:`);
        console.log(`   - Slash commands: ${summary.slashCommands}`);
        console.log(`   - User context menus: ${summary.userContextMenus}`);
        console.log(`   - Message context menus: ${summary.messageContextMenus}`);
    }

    private buildCommandsFromRegistry(): any[] {
        const commands = [];

        // Build slash commands
        const slashCommands = getAllSlashCommands();
        for (const [, CommandClass] of slashCommands) {
            const instance = new CommandClass();
            const builder = instance.buildCommand();
            commands.push(builder.toJSON());
        }

        // Build user context menus
        const userContextMenus = getAllUserContextMenus();
        for (const [, CommandClass] of userContextMenus) {
            const instance = new CommandClass();
            const builder = instance.buildCommand();
            commands.push(builder.toJSON());
        }

        // Build message context menus
        const messageContextMenus = getAllMessageContextMenus();
        for (const [, CommandClass] of messageContextMenus) {
            const instance = new CommandClass();
            const builder = instance.buildCommand();
            commands.push(builder.toJSON());
        }

        return commands;
    }

    private logRegistrationSummary(registeredCount: number, totalCommands: number): void {
        const summary = this.getDiscoveredCommandsSummary();

        console.log(`✅ Successfully registered ${registeredCount} discovered commands with Discord`);
        console.log(`🎯 Registration Summary:`);
        console.log(`   - Slash commands: ${summary.slashCommands}`);
        console.log(`   - User context menus: ${summary.userContextMenus}`);
        console.log(`   - Message context menus: ${summary.messageContextMenus}`);
        console.log(`   - Total: ${totalCommands}`);
    }
}
