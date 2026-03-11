import { ApplicationCommandType, ChannelType, PermissionsBitField, type Client, type RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
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
import { COMMAND_TYPES } from "app/domain/types/commands/CommandTypes.js";

/**
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
            type: ApplicationCommandType.ChatInput,
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
                channel_types: this.adaptChannelTypes(option.channelTypes)
            })),
            default_member_permissions: this.adaptDefaultMemberPermissions(command.defaultMemberPermissions),
            dm_permission: command.dmPermission,
            nsfw: command.nsfw
        };
    }

    /**
     * Adapt platform user context command to Discord format
     */
    private adaptUserContextCommand(command: PlatformUserContextCommand): RESTPostAPIApplicationCommandsJSONBody {
        return {
            type: ApplicationCommandType.User,
            name: command.name,
            default_member_permissions: this.adaptDefaultMemberPermissions(command.defaultMemberPermissions),
            dm_permission: command.dmPermission
        };
    }

    /**
     * Adapt platform message context command to Discord format
     */
    private adaptMessageContextCommand(command: PlatformMessageContextCommand): RESTPostAPIApplicationCommandsJSONBody {
        return {
            type: ApplicationCommandType.Message,
            name: command.name,
            default_member_permissions: this.adaptDefaultMemberPermissions(command.defaultMemberPermissions),
            dm_permission: command.dmPermission
        };
    }

    /**
     * Discord expects default_member_permissions as a decimal bitfield string.
     * Supports both numeric-string bitfields and Discord permission flag names.
     */
    private adaptDefaultMemberPermissions(permissions?: string[]): string | undefined {
        if (!permissions || permissions.length === 0) {
            return undefined;
        }

        let bitfield = 0n;

        for (const permission of permissions) {
            if (/^\d+$/.test(permission)) {
                bitfield |= BigInt(permission);
                continue;
            }

            if (permission in PermissionsBitField.Flags) {
                const flag = PermissionsBitField.Flags[permission as keyof typeof PermissionsBitField.Flags];
                bitfield |= BigInt(flag.toString());
                continue;
            }

            throw new Error(`Unknown permission flag: "${permission}". Check spelling against PermissionsBitField.Flags.`);
        }

        return bitfield === 0n ? undefined : bitfield.toString();
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
            default: throw new Error(`Unknown option type: "${type}". Valid types: string, integer, boolean, user, channel, role, mentionable, number, attachment.`);
        }
    }

    /**
     * Adapt platform channel type strings to Discord ChannelType enum values.
     * Supports numeric strings (e.g. "0") and enum-like names (e.g. "GuildText", "guild_text").
     */
    private adaptChannelTypes(channelTypes?: string[]): ChannelType[] | undefined {
        if (!channelTypes || channelTypes.length === 0) {
            return undefined;
        }

        const enumEntries = Object.entries(ChannelType)
            .filter(([, value]) => typeof value === 'number') as Array<[string, number]>;

        const validNumericTypes = new Set(enumEntries.map(([, value]) => value));
        const normalizedNameToType = new Map(
            enumEntries.map(([name, value]) => [this.normalizeEnumName(name), value as ChannelType])
        );

        const adapted = channelTypes.map((channelType) => {
            if (/^\d+$/.test(channelType)) {
                const numericType = Number(channelType);
                if (!validNumericTypes.has(numericType)) {
                    throw new Error(`Unknown channel type: "${channelType}".`);
                }
                return numericType as ChannelType;
            }

            const mapped = normalizedNameToType.get(this.normalizeEnumName(channelType));
            if (mapped === undefined) {
                throw new Error(`Unknown channel type: "${channelType}".`);
            }
            return mapped;
        });

        return Array.from(new Set(adapted));
    }

    private normalizeEnumName(value: string): string {
        return value.toLowerCase().replace(/[^a-z0-9]/g, '');
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
