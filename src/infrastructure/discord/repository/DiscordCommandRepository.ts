import { ApplicationCommandType, ChannelType, PermissionsBitField, type Client, type RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import type { CommandRepository } from "app/domain/interface/repository/CommandRepository.js";

/**
 * Discord API implementation of CommandRepository
 */
export class DiscordCommandRepository implements CommandRepository {
    private readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async registerCommands(commands: Record<string, unknown>[]): Promise<number> {
        const application = await this.requireClientApplication();

        if (commands.length === 0) {
            return 0;
        }

        const discordCommands = commands.map(cmd => this.adaptToDiscordCommand(cmd));
        const registeredCommands = await application.commands.set(discordCommands);
        return registeredCommands.size;
    }

    private adaptToDiscordCommand(command: Record<string, unknown>): RESTPostAPIApplicationCommandsJSONBody {
        const type = command.type as string | undefined;
        const name = command.name as string;

        if (type === 'slash' || type === undefined) {
            return {
                type: ApplicationCommandType.ChatInput,
                name,
                description: (command.description as string) || 'No description',
                options: this.adaptOptions(command.options as unknown[] | undefined),
                default_member_permissions: this.adaptDefaultMemberPermissions(command.defaultMemberPermissions as string[] | undefined),
                dm_permission: command.dmPermission as boolean | undefined,
                nsfw: command.nsfw as boolean | undefined
            };
        }

        if (type === 'context:user') {
            return {
                type: ApplicationCommandType.User,
                name,
                default_member_permissions: this.adaptDefaultMemberPermissions(command.defaultMemberPermissions as string[] | undefined),
                dm_permission: command.dmPermission as boolean | undefined
            };
        }

        if (type === 'context:message') {
            return {
                type: ApplicationCommandType.Message,
                name,
                default_member_permissions: this.adaptDefaultMemberPermissions(command.defaultMemberPermissions as string[] | undefined),
                dm_permission: command.dmPermission as boolean | undefined
            };
        }

        throw new Error(`Unknown command type: "${type}"`);
    }

    private adaptOptions(options?: unknown[]): RESTPostAPIApplicationCommandsJSONBody['options'] {
        if (!options || options.length === 0) return undefined;
        return options.map(opt => {
            const o = opt as Record<string, unknown>;
            return {
                type: this.adaptOptionType(o.type as string),
                name: o.name as string,
                description: (o.description as string) || '',
                required: o.required as boolean | undefined,
                choices: o.choices as Array<{ name: string; value: string | number }> | undefined,
                min_value: o.minValue as number | undefined,
                max_value: o.maxValue as number | undefined,
                min_length: o.minLength as number | undefined,
                max_length: o.maxLength as number | undefined,
                autocomplete: o.autocomplete as boolean | undefined,
                channel_types: this.adaptChannelTypes(o.channelTypes as string[] | undefined)
            };
        }) as RESTPostAPIApplicationCommandsJSONBody['options'];
    }

    private adaptDefaultMemberPermissions(permissions?: string[]): string | undefined {
        if (!permissions || permissions.length === 0) return undefined;

        let bitfield = 0n;
        for (const permission of permissions) {
            if (/^\d+$/.test(permission)) {
                bitfield |= BigInt(permission);
            } else if (permission in PermissionsBitField.Flags) {
                const flag = PermissionsBitField.Flags[permission as keyof typeof PermissionsBitField.Flags];
                bitfield |= BigInt(flag.toString());
            } else {
                throw new Error(`Unknown permission flag: "${permission}"`);
            }
        }

        return bitfield === 0n ? undefined : bitfield.toString();
    }

    private adaptOptionType(type: string): number {
        const types: Record<string, number> = {
            string: 3, integer: 4, boolean: 5, user: 6,
            channel: 7, role: 8, mentionable: 9, number: 10, attachment: 11
        };
        if (!(type in types)) throw new Error(`Unknown option type: "${type}"`);
        return types[type];
    }

    private adaptChannelTypes(channelTypes?: string[]): ChannelType[] | undefined {
        if (!channelTypes || channelTypes.length === 0) return undefined;

        const enumEntries = Object.entries(ChannelType)
            .filter(([, value]) => typeof value === 'number') as Array<[string, number]>;

        const validNumericTypes = new Set(enumEntries.map(([, value]) => value));
        const normalizedNameToType = new Map(
            enumEntries.map(([name, value]) => [this.normalizeEnumName(name), value as ChannelType])
        );

        return Array.from(new Set(channelTypes.map((channelType) => {
            if (/^\d+$/.test(channelType)) {
                const numericType = Number(channelType);
                if (!validNumericTypes.has(numericType)) throw new Error(`Unknown channel type: "${channelType}"`);
                return numericType as ChannelType;
            }
            const mapped = normalizedNameToType.get(this.normalizeEnumName(channelType));
            if (mapped === undefined) throw new Error(`Unknown channel type: "${channelType}"`);
            return mapped;
        })));
    }

    private normalizeEnumName(value: string): string {
        return value.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    async clearAllCommands(): Promise<number> {
        const application = await this.requireClientApplication();

        const currentCommands = await application.commands.fetch();
        const commandCount = currentCommands.size;
        await application.commands.set([]);
        return commandCount;
    }

    async getRegisteredCommands(): Promise<Record<string, unknown>[]> {
        const application = await this.requireClientApplication();

        const commands = await application.commands.fetch();
        return commands.map(command => {

            const json = command.toJSON() as any;
            const type = json.type;
            return {
                type: type === ApplicationCommandType.ChatInput ? 'slash'
                    : type === ApplicationCommandType.User ? 'context:user'
                        : 'context:message',
                name: json.name,
                description: json.description
            };
        });
    }

    private async requireClientApplication() {
        if (!this.client.application) {
            await this.waitForReady();
        }

        if (!this.client.application) {
            throw new Error("Discord client application is not available");
        }

        return this.client.application;
    }

    private waitForReady(): Promise<void> {
        if (this.client.isReady()) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const onReady = () => {
                this.client.off("error", onError);
                resolve();
            };
            const onError = (error: Error) => {
                this.client.off("ready", onReady);
                reject(error);
            };

            this.client.once("ready", onReady);
            this.client.once("error", onError);
        });
    }
}
