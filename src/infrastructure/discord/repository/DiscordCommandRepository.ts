import type { Client, RESTPostAPIApplicationCommandsJSONBody, ApplicationCommandType } from "discord.js";
import type { CommandRepository } from "app/domain/interface/repository/CommandRepository.js";
import type { PlatformCommand } from "app/domain/types/commands/PlatformCommand.js";
import type { PlatformSlashCommand } from "app/domain/interface/commands/PlatformSlashCommand.js";
import type { PlatformUserContextCommand } from "app/domain/interface/commands/PlatformUserContextCommand.js";
import type { PlatformMessageContextCommand } from "app/domain/interface/commands/PlatformMessageContextCommand.js";
import {
    isPlatformSlashCommand,
    isPlatformUserContextCommand,
    isPlatformMessageContextCommand,
} from "app/domain/types/commands/CommandTypeGuards.js";
import { COMMAND_TYPES } from "app/domain/types/commands/CommandTypes.js";/**
 * Discord API implementation of CommandRepository
 * Handles registration and management of Discord application commands
 */
export class DiscordCommandRepository implements CommandRepository {
    private readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async registerCommands(commands: PlatformCommand[]): Promise<number> {
        if (!this.client.application) {
            throw new Error("Discord client application is not available");
        }

        if (commands.length === 0) {
            return 0;
        }

        // Convert platform commands to Discord format
        const discordCommands = commands.map(cmd => this.adaptToDiscordCommand(cmd));

        const registeredCommands = await this.client.application.commands.set(discordCommands);
        return registeredCommands.size;
    }

    /**
     * Adapt a platform command to Discord.js format
     */
    private adaptToDiscordCommand(command: PlatformCommand): RESTPostAPIApplicationCommandsJSONBody {
        if (isPlatformSlashCommand(command)) {
            return this.adaptSlashCommand(command);
        } else if (isPlatformUserContextCommand(command)) {
            return this.adaptUserContextCommand(command);
        } else {
            return this.adaptMessageContextCommand(command as PlatformMessageContextCommand);
        }
    }

    /**
     * Adapt platform slash command to Discord format
     */
    private adaptSlashCommand(command: PlatformSlashCommand): RESTPostAPIApplicationCommandsJSONBody {
        return {
            type: 1 as ApplicationCommandType.ChatInput, // ApplicationCommandType.ChatInput
            name: command.name,
            description: command.description,
            options: command.options?.map(option => ({
                type: this.adaptOptionType(option.type),
                name: option.name,
                description: option.description,
                required: option.required,
                choices: option.choices,
                min_value: option.minValue,
                max_value: option.maxValue,
                min_length: option.minLength,
                max_length: option.maxLength,
                autocomplete: option.autocomplete,
                channel_types: option.channelTypes as any
            })),
            default_member_permissions: command.defaultMemberPermissions?.join('|'),
            dm_permission: command.dmPermission,
            nsfw: command.nsfw
        };
    }

    /**
     * Adapt platform user context command to Discord format
     */
    private adaptUserContextCommand(command: PlatformUserContextCommand): RESTPostAPIApplicationCommandsJSONBody {
        return {
            type: 2 as ApplicationCommandType.User, // ApplicationCommandType.User
            name: command.name,
            default_member_permissions: command.defaultMemberPermissions?.join('|'),
            dm_permission: command.dmPermission
        };
    }

    /**
     * Adapt platform message context command to Discord format
     */
    private adaptMessageContextCommand(command: PlatformMessageContextCommand): RESTPostAPIApplicationCommandsJSONBody {
        return {
            type: 3 as ApplicationCommandType.Message, // ApplicationCommandType.Message
            name: command.name,
            default_member_permissions: command.defaultMemberPermissions?.join('|'),
            dm_permission: command.dmPermission
        };
    }

    /**
     * Adapt platform option type to Discord option type
     */
    private adaptOptionType(type: string): number {
        switch (type) {
            case 'string': return 3;
            case 'integer': return 4;
            case 'boolean': return 5;
            case 'user': return 6;
            case 'channel': return 7;
            case 'role': return 8;
            case 'mentionable': return 9;
            case 'number': return 10;
            case 'attachment': return 11;
            default: return 3; // Default to string
        }
    }

    async clearAllCommands(): Promise<number> {
        if (!this.client.application) {
            throw new Error("Discord client application is not available");
        }

        const currentCommands = await this.client.application.commands.fetch();
        const commandCount = currentCommands.size;

        await this.client.application.commands.set([]);

        return commandCount;
    }

    async getRegisteredCommands(): Promise<PlatformCommand[]> {
        if (!this.client.application) {
            throw new Error("Discord client application is not available");
        }

        const commands = await this.client.application.commands.fetch();
        return commands.map(command => this.adaptFromDiscordCommand(command.toJSON() as RESTPostAPIApplicationCommandsJSONBody));
    }

    /**
     * Adapt a Discord command back to platform format (simplified version)
     */
    private adaptFromDiscordCommand(discordCommand: RESTPostAPIApplicationCommandsJSONBody): PlatformCommand {
        const type = discordCommand.type;

        if (type === 1) { // ApplicationCommandType.ChatInput
            return {
                type: COMMAND_TYPES.SLASH,
                name: discordCommand.name,
                description: discordCommand.description || 'No description'
            };
        } else if (type === 2) { // ApplicationCommandType.User
            return {
                type: COMMAND_TYPES.CONTEXT_USER,
                name: discordCommand.name
            };
        } else { // ApplicationCommandType.Message
            return {
                type: COMMAND_TYPES.CONTEXT_MESSAGE,
                name: discordCommand.name
            };
        }
    }
}
