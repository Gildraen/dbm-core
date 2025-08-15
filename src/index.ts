import { type ModuleInterface } from "app/domain/interface/ModuleInterface.js";
import { type MigrationContext } from "app/domain/types/MigrationContext.js";

// Public API for external module developers
export {
    // Core interface for module development
    type ModuleInterface,

    // Types needed for module development
    type MigrationContext
};

// Export decorators for module development
export {
    // Command decorators
    SlashCommand,
    UserContextMenu,
    MessageContextMenu,
    
    // Listener decorators
    InteractionListener,
    StringSelectListener,
    UserSelectListener,
    RoleSelectListener,
    ChannelSelectListener,
    MentionableSelectListener,
    AutocompleteListener,
    EventListener
} from "app/domain/decorators/index.js";