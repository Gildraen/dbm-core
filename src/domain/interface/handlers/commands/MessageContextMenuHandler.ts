import type { CommandHandlerInterface } from "./CommandHandlerInterface.js";
import type { PlatformMessageContextCommand } from "app/domain/interface/commands/PlatformMessageContextCommand.js";
import { REGISTRY_KINDS } from "../../registry/types.js";

export interface MessageContextMenuHandler extends CommandHandlerInterface<typeof REGISTRY_KINDS.CONTEXT_MESSAGE> {
    name: string;
    buildCommand(): PlatformMessageContextCommand;
}
