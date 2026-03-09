import type { HandlerInterface } from "../HandlerInterface.js";
import type { PlatformUserContextCommand } from "app/domain/interface/commands/PlatformUserContextCommand.js";
import { REGISTRY_KINDS } from "../../registry/types.js";

export interface UserContextMenuHandler extends HandlerInterface<typeof REGISTRY_KINDS.CONTEXT_USER> {
    name: string;
    buildCommand(): PlatformUserContextCommand;
}
