import { COMMAND_TYPES } from "app/domain/types/commands/CommandTypes.js";

/**
 * Message context menu command
 */
export interface PlatformMessageContextCommand {
    type: typeof COMMAND_TYPES.CONTEXT_MESSAGE;
    name: string;
    description?: string;
    defaultMemberPermissions?: string[];
    dmPermission?: boolean;
}
