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
    ModalSubmitInteraction
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

// Select Menu Event Listeners
export interface StringSelectListener {
    customId: string;
    handle(interaction: StringSelectMenuInteraction): Promise<unknown>;
}

export interface UserSelectListener {
    customId: string;
    handle(interaction: UserSelectMenuInteraction): Promise<unknown>;
}

export interface RoleSelectListener {
    customId: string;
    handle(interaction: RoleSelectMenuInteraction): Promise<unknown>;
}

export interface ChannelSelectListener {
    customId: string;
    handle(interaction: ChannelSelectMenuInteraction): Promise<unknown>;
}

export interface MentionableSelectListener {
    customId: string;
    handle(interaction: MentionableSelectMenuInteraction): Promise<unknown>;
}

// Autocomplete Event Listener
export interface AutocompleteListener {
    commandName: string;
    handle(interaction: AutocompleteInteraction): Promise<unknown>;
}

// General Interaction Event Listener
export interface InteractionListener {
    setup(client: any): void;
}

// Event Listener - Generic to avoid platform-specific dependency
export interface EventListener {
    handle(...args: unknown[]): Promise<unknown>;
}

// Event metadata for decorators
export interface EventMetadata {
    eventName: string;
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
