/**
 * Platform registry type definitions and constants
 */

import type { SlashCommandMetadata } from "app/domain/types/metadata/SlashCommandMetadata.js";
import type { EventListenerMetadata } from "app/domain/types/metadata/EventListenerMetadata.js";
import type { AutocompleteListenerMetadata } from "app/domain/types/metadata/AutocompleteListenerMetadata.js";
import type { UserContextMenuMetadata } from "app/domain/types/metadata/UserContextMenuMetadata.js";
import type { MessageContextMenuMetadata } from "app/domain/types/metadata/MessageContextMenuMetadata.js";
import type { StringSelectMetadata } from "app/domain/types/metadata/StringSelectMetadata.js";
import type { UserSelectMetadata } from "app/domain/types/metadata/UserSelectMetadata.js";
import type { RoleSelectMetadata } from "app/domain/types/metadata/RoleSelectMetadata.js";
import type { ChannelSelectMetadata } from "app/domain/types/metadata/ChannelSelectMetadata.js";
import type { MentionableSelectMetadata } from "app/domain/types/metadata/MentionableSelectMetadata.js";

import type { SlashCommandHandler } from "../handlers/commands/SlashCommandHandler.js";
import type { UserContextMenuHandler } from "../handlers/commands/UserContextMenuHandler.js";
import type { MessageContextMenuHandler } from "../handlers/commands/MessageContextMenuHandler.js";
import type { EventHandler } from "../handlers/listeners/EventHandler.js";
import type { AutocompleteHandler } from "../handlers/listeners/AutocompleteHandler.js";
import type { StringSelectHandler } from "../handlers/components/StringSelectHandler.js";
import type { UserSelectHandler } from "../handlers/components/UserSelectHandler.js";
import type { RoleSelectHandler } from "../handlers/components/RoleSelectHandler.js";
import type { ChannelSelectHandler } from "../handlers/components/ChannelSelectHandler.js";
import type { MentionableSelectHandler } from "../handlers/components/MentionableSelectHandler.js";
import type { HandlerInterface } from "../handlers/HandlerInterface.js";

import type { CommandInteraction } from "app/domain/interface/platform/interactions/CommandInteraction.js";
import type { UserContextInteraction } from "app/domain/interface/platform/interactions/UserContextInteraction.js";
import type { MessageContextInteraction } from "app/domain/interface/platform/interactions/MessageContextInteraction.js";
import type { AutocompleteInteraction } from "app/domain/interface/platform/interactions/AutocompleteInteraction.js";
import type { SelectInteraction } from "app/domain/interface/platform/interactions/SelectInteraction.js";

export type RegistryKey = string;

/**
 * Registry kind constants - use these instead of string literals
 * Organized by category for better clarity
 */
export const REGISTRY_KINDS = {
    // Commands
    SLASH: 'slash',
    CONTEXT_USER: 'context:user',
    CONTEXT_MESSAGE: 'context:message',

    // Listeners
    AUTOCOMPLETE: 'autocomplete',
    EVENT: 'event',

    // Components - Select Menus
    STRING_SELECT: 'component:string-select',
    USER_SELECT: 'component:user-select',
    ROLE_SELECT: 'component:role-select',
    CHANNEL_SELECT: 'component:channel-select',
    MENTIONABLE_SELECT: 'component:mentionable-select',

    // Components - Other (for future use)
    BUTTON: 'component:button',
    MODAL: 'component:modal',
} as const;

export type Kind = typeof REGISTRY_KINDS[keyof typeof REGISTRY_KINDS];

export type CommandKind =
    | typeof REGISTRY_KINDS.SLASH
    | typeof REGISTRY_KINDS.CONTEXT_USER
    | typeof REGISTRY_KINDS.CONTEXT_MESSAGE;

/**
 * Type-safe mapping between Kind and its corresponding metadata type
 */
export type KindMetadataMap = {
    // Commands
    [REGISTRY_KINDS.SLASH]: SlashCommandMetadata;
    [REGISTRY_KINDS.CONTEXT_USER]: UserContextMenuMetadata;
    [REGISTRY_KINDS.CONTEXT_MESSAGE]: MessageContextMenuMetadata;

    // Listeners
    [REGISTRY_KINDS.AUTOCOMPLETE]: AutocompleteListenerMetadata;
    [REGISTRY_KINDS.EVENT]: EventListenerMetadata;

    // Components - Select Menus
    [REGISTRY_KINDS.STRING_SELECT]: StringSelectMetadata;
    [REGISTRY_KINDS.USER_SELECT]: UserSelectMetadata;
    [REGISTRY_KINDS.ROLE_SELECT]: RoleSelectMetadata;
    [REGISTRY_KINDS.CHANNEL_SELECT]: ChannelSelectMetadata;
    [REGISTRY_KINDS.MENTIONABLE_SELECT]: MentionableSelectMetadata;

    // Components - Other (placeholder for future implementation)
    [REGISTRY_KINDS.BUTTON]: never; // TODO: Create ButtonMetadata
    [REGISTRY_KINDS.MODAL]: never; // TODO: Create ModalMetadata
};

/**
 * Type-safe mapping between Kind and its corresponding handler interface
 */
export type KindHandlerMap = {
    // Commands
    [REGISTRY_KINDS.SLASH]: SlashCommandHandler;
    [REGISTRY_KINDS.CONTEXT_USER]: UserContextMenuHandler;
    [REGISTRY_KINDS.CONTEXT_MESSAGE]: MessageContextMenuHandler;

    // Listeners
    [REGISTRY_KINDS.AUTOCOMPLETE]: AutocompleteHandler;
    [REGISTRY_KINDS.EVENT]: EventHandler;

    // Components - Select Menus
    [REGISTRY_KINDS.STRING_SELECT]: StringSelectHandler;
    [REGISTRY_KINDS.USER_SELECT]: UserSelectHandler;
    [REGISTRY_KINDS.ROLE_SELECT]: RoleSelectHandler;
    [REGISTRY_KINDS.CHANNEL_SELECT]: ChannelSelectHandler;
    [REGISTRY_KINDS.MENTIONABLE_SELECT]: MentionableSelectHandler;

    // Components - Other (placeholder for future implementation)
    [REGISTRY_KINDS.BUTTON]: HandlerInterface; // TODO: Create ButtonHandler
    [REGISTRY_KINDS.MODAL]: HandlerInterface; // TODO: Create ModalHandler
};

/**
 * Type-safe mapping between Kind and the parameters its handler.handle() method accepts
 * This allows TypeScript to know the exact parameter types for each handler kind
 */
export type KindHandleArgsMap = {
    // Commands - all take single interaction parameter
    [REGISTRY_KINDS.SLASH]: [interaction: CommandInteraction];
    [REGISTRY_KINDS.CONTEXT_USER]: [interaction: UserContextInteraction];
    [REGISTRY_KINDS.CONTEXT_MESSAGE]: [interaction: MessageContextInteraction];

    // Listeners
    [REGISTRY_KINDS.AUTOCOMPLETE]: [interaction: AutocompleteInteraction];
    [REGISTRY_KINDS.EVENT]: unknown[]; // Event handlers accept variable args based on event type

    // Components - Select Menus (all take SelectInteraction)
    [REGISTRY_KINDS.STRING_SELECT]: [interaction: SelectInteraction];
    [REGISTRY_KINDS.USER_SELECT]: [interaction: SelectInteraction];
    [REGISTRY_KINDS.ROLE_SELECT]: [interaction: SelectInteraction];
    [REGISTRY_KINDS.CHANNEL_SELECT]: [interaction: SelectInteraction];
    [REGISTRY_KINDS.MENTIONABLE_SELECT]: [interaction: SelectInteraction];

    // Components - Other (placeholder for future implementation)
    [REGISTRY_KINDS.BUTTON]: unknown[]; // TODO: Define ButtonInteraction
    [REGISTRY_KINDS.MODAL]: unknown[]; // TODO: Define ModalInteraction
};