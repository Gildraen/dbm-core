import type { PlatformSlashCommand } from "app/domain/interface/commands/PlatformSlashCommand.js";
import type { PlatformUserContextCommand } from "app/domain/interface/commands/PlatformUserContextCommand.js";
import type { PlatformMessageContextCommand } from "app/domain/interface/commands/PlatformMessageContextCommand.js";

/**
 * Union type for all platform commands
 */
export type PlatformCommand =
    | PlatformSlashCommand
    | PlatformUserContextCommand
    | PlatformMessageContextCommand;
