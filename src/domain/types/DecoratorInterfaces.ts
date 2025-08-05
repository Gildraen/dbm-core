import type {
    SlashCommandBuilder,
    ContextMenuCommandBuilder,
    ChatInputCommandInteraction,
    UserContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
    RoleSelectMenuInteraction,
    ChannelSelectMenuInteraction,
    MentionableSelectMenuInteraction,
    AutocompleteInteraction,
    ButtonInteraction,
    ModalSubmitInteraction,
    Client,
    ClientEvents
} from "discord.js";

// Slash Command Interface
export interface SlashCommand {
    name: string;
    description: string;
    buildCommand(): SlashCommandBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<unknown>;
}

// Context Menu Interfaces
export interface UserContextMenu {
    name: string;
    buildCommand(): ContextMenuCommandBuilder;
    execute(interaction: UserContextMenuCommandInteraction): Promise<unknown>;
}

export interface MessageContextMenu {
    name: string;
    buildCommand(): ContextMenuCommandBuilder;
    execute(interaction: MessageContextMenuCommandInteraction): Promise<unknown>;
}

// Select Menu Interfaces
export interface StringSelectHandler {
    customId: string;
    handle(interaction: StringSelectMenuInteraction): Promise<unknown>;
}

export interface UserSelectHandler {
    customId: string;
    handle(interaction: UserSelectMenuInteraction): Promise<unknown>;
}

export interface RoleSelectHandler {
    customId: string;
    handle(interaction: RoleSelectMenuInteraction): Promise<unknown>;
}

export interface ChannelSelectHandler {
    customId: string;
    handle(interaction: ChannelSelectMenuInteraction): Promise<unknown>;
}

export interface MentionableSelectHandler {
    customId: string;
    handle(interaction: MentionableSelectMenuInteraction): Promise<unknown>;
}

// Autocomplete Interface
export interface AutocompleteHandler {
    commandName: string;
    handle(interaction: AutocompleteInteraction): Promise<unknown>;
}

// General Interaction Handler Interface
export interface InteractionHandler {
    setup(client: Client): void;
}

// Discord Event Interface
export interface EventHandler {
    handle(...args: any[]): Promise<unknown>;
}

// Event metadata for decorators
export interface EventMetadata {
    eventName: keyof ClientEvents;
    once?: boolean;
}

// Context menu metadata
export interface ContextMenuMetadata {
    name: string;
    type: 'USER' | 'MESSAGE';
}

// Select menu metadata
export interface SelectMenuMetadata {
    customId: string;
    type: 'STRING' | 'USER' | 'ROLE' | 'CHANNEL' | 'MENTIONABLE';
}

// Autocomplete metadata
export interface AutocompleteMetadata {
    commandName: string;
}
