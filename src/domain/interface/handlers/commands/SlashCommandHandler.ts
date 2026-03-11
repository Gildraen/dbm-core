import type { CommandHandlerInterface } from "./CommandHandlerInterface.js";
import type { PlatformSlashCommand } from "app/domain/interface/commands/PlatformSlashCommand.js";
import { REGISTRY_KINDS } from "../../registry/types.js";

export interface SlashCommandHandler extends CommandHandlerInterface<typeof REGISTRY_KINDS.SLASH> {
    name: string;
    description: string;
    buildCommand(): PlatformSlashCommand;
}
