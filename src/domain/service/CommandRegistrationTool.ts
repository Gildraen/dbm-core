import type {
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    Client
} from "discord.js";

export interface CommandData {
    name: string;
    description?: string;
    builder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | ContextMenuCommandBuilder;
    type: 'SLASH' | 'USER_CONTEXT' | 'MESSAGE_CONTEXT';
}

/**
 * Command Registration Tool
 * 
 * Provides a safe interface for modules to declare their Discord commands
 * without giving them direct access to the Discord client.
 * 
 * This tool collects command declarations and dbm-core handles the actual
 * Discord API registration.
 */
export class CommandRegistrationTool {
    private readonly commands: CommandData[] = [];
    private readonly dryRun: boolean;

    constructor(dryRun: boolean = false) {
        this.dryRun = dryRun;
    }

    /**
     * Register a slash command
     * @param name - Command name
     * @param description - Command description
     * @param builder - SlashCommandBuilder with full command configuration
     */
    addSlashCommand(name: string, description: string, builder: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder): void {
        if (this.dryRun) {
            console.log(`🔍 [DRY RUN] Would register slash command: /${name}`);
            return;
        }

        const commandData: CommandData = {
            name,
            description,
            builder,
            type: 'SLASH'
        };

        this.commands.push(commandData);
        console.log(`📝 Collected slash command: /${name}`);
    }

    /**
     * Register a user context menu command
     * @param name - Command name
     * @param builder - ContextMenuCommandBuilder configured for user commands
     */
    addUserContextMenu(name: string, builder: ContextMenuCommandBuilder): void {
        if (this.dryRun) {
            console.log(`🔍 [DRY RUN] Would register user context menu: ${name}`);
            return;
        }

        const commandData: CommandData = {
            name,
            builder,
            type: 'USER_CONTEXT'
        };

        this.commands.push(commandData);
        console.log(`📝 Collected user context menu: ${name}`);
    }

    /**
     * Register a message context menu command
     * @param name - Command name
     * @param builder - ContextMenuCommandBuilder configured for message commands
     */
    addMessageContextMenu(name: string, builder: ContextMenuCommandBuilder): void {
        if (this.dryRun) {
            console.log(`🔍 [DRY RUN] Would register message context menu: ${name}`);
            return;
        }

        const commandData: CommandData = {
            name,
            builder,
            type: 'MESSAGE_CONTEXT'
        };

        this.commands.push(commandData);
        console.log(`📝 Collected message context menu: ${name}`);
    }

    /**
     * Get all collected commands
     * Used by dbm-core to perform actual Discord registration
     */
    getCommands(): CommandData[] {
        return [...this.commands];
    }

    /**
     * Get command count by type
     */
    getCommandSummary(): {
        slash: number;
        userContext: number;
        messageContext: number;
        total: number;
    } {
        const slash = this.commands.filter(cmd => cmd.type === 'SLASH').length;
        const userContext = this.commands.filter(cmd => cmd.type === 'USER_CONTEXT').length;
        const messageContext = this.commands.filter(cmd => cmd.type === 'MESSAGE_CONTEXT').length;

        return {
            slash,
            userContext,
            messageContext,
            total: this.commands.length
        };
    }

    /**
     * Clear all collected commands
     * Used for testing or reset scenarios
     */
    clear(): void {
        this.commands.length = 0;
        console.log("🧹 Cleared all collected commands");
    }

    /**
     * Internal method: Perform actual Discord registration
     * Called by dbm-core after all modules have declared their commands
     */
    async performDiscordRegistration(client: Client): Promise<unknown> {
        if (this.dryRun) {
            console.log(`🔍 [DRY RUN] Would register ${this.commands.length} commands with Discord`);
            return;
        }

        if (this.commands.length === 0) {
            console.log("ℹ️  No commands to register with Discord");
            return;
        }

        try {
            // Convert command data to Discord API format
            const discordCommands = this.commands.map(cmd => cmd.builder.toJSON());
            
            // Register with Discord
            const registeredCommands = await client.application?.commands.set(discordCommands);
            
            console.log(`✅ Successfully registered ${registeredCommands?.size || 0} commands with Discord`);
            
            // Log details
            for (const cmd of this.commands) {
                console.log(`   - ${cmd.type}: ${cmd.name}`);
            }
            
        } catch (error) {
            console.error("❌ Failed to register commands with Discord:", error);
            throw error;
        }
    }
}
