import { COMMAND_TYPES } from "app/domain/types/commands/CommandTypes.js";

/**
 * User context menu command
 */
export interface PlatformUserContextCommand {
    type: typeof COMMAND_TYPES.CONTEXT_USER;
    name: string;
    description?: string;
    defaultMemberPermissions?: string[];
    dmPermission?: boolean;
}
