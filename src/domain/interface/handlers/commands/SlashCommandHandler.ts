import type { HandlerInterface } from "../HandlerInterface.js";
import type { PlatformSlashCommand } from "app/domain/interface/commands/PlatformSlashCommand.js";
import { REGISTRY_KINDS } from "../../registry/types.js";

export interface SlashCommandHandler extends HandlerInterface<typeof REGISTRY_KINDS.SLASH> {
    name: string;
    description: string;
    buildCommand(): PlatformSlashCommand;
}
