import { type ModuleInterface } from "app/domain/interface/ModuleInterface.js";
import { type MigrationContext } from "app/domain/types/MigrationContext.js";

// Decorator imports
import {
    SlashCommand,
    UserContextMenu,
    MessageContextMenu,
    InteractionListener,
    StringSelectListener,
    UserSelectListener,
    RoleSelectListener,
    ChannelSelectListener,
    MentionableSelectListener,
    AutocompleteListener,
    EventListener
} from "app/infrastructure/decorator/index.js";

// Public API for external module developers
export {
    // Core interface for module development
    type ModuleInterface,

    // Types needed for module development
    type MigrationContext,

    // Decorators for module developers
    SlashCommand,
    UserContextMenu,
    MessageContextMenu,
    InteractionListener,
    StringSelectListener,
    UserSelectListener,
    RoleSelectListener,
    ChannelSelectListener,
    MentionableSelectListener,
    AutocompleteListener,
    EventListener
};