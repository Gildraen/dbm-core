import type { PlatformCommand } from "./PlatformCommand.js";
import type { PlatformSlashCommand } from "app/domain/interface/commands/PlatformSlashCommand.js";
import type { PlatformUserContextCommand } from "app/domain/interface/commands/PlatformUserContextCommand.js";
import type { PlatformMessageContextCommand } from "app/domain/interface/commands/PlatformMessageContextCommand.js";
import { COMMAND_TYPES } from "./CommandTypes.js";

/**
 * Type guard to check if a command is a slash command
 */
export function isPlatformSlashCommand(command: PlatformCommand): command is PlatformSlashCommand {
    return command.type === COMMAND_TYPES.SLASH;
}

/**
 * Type guard to check if a command is a user context command
 */
export function isPlatformUserContextCommand(command: PlatformCommand): command is PlatformUserContextCommand {
    return command.type === COMMAND_TYPES.CONTEXT_USER;
}

/**
 * Type guard to check if a command is a message context command
 */
export function isPlatformMessageContextCommand(command: PlatformCommand): command is PlatformMessageContextCommand {
    return command.type === COMMAND_TYPES.CONTEXT_MESSAGE;
}
