import { COMMAND_TYPES } from "app/domain/types/commands/CommandTypes.js";
import type { PlatformCommandOption } from "./PlatformCommandOption.js";

/**
 * Slash command structure
 */
export interface PlatformSlashCommand {
    type: typeof COMMAND_TYPES.SLASH;
    name: string;
    description: string; // Required for slash commands
    options?: PlatformCommandOption[];
    defaultMemberPermissions?: string[];
    dmPermission?: boolean;
    nsfw?: boolean;
}
