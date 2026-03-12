import type { CommandHandlerInterface } from "./CommandHandlerInterface.js";
import type { PlatformUserContextCommand } from "app/domain/interface/commands/PlatformUserContextCommand.js";
import { REGISTRY_KINDS } from "../../registry/types.js";

export interface UserContextMenuHandler extends CommandHandlerInterface<typeof REGISTRY_KINDS.CONTEXT_USER> {
    name: string;
    buildCommand(): PlatformUserContextCommand;
}
