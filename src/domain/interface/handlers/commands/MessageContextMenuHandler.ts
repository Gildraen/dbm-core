import type { HandlerInterface } from "../HandlerInterface.js";
import type { PlatformMessageContextCommand } from "app/domain/interface/commands/PlatformMessageContextCommand.js";
import { REGISTRY_KINDS } from "../../registry/types.js";

export interface MessageContextMenuHandler extends HandlerInterface<typeof REGISTRY_KINDS.CONTEXT_MESSAGE> {
    name: string;
    buildCommand(): PlatformMessageContextCommand;
}
