import type { PlatformCommand } from "app/domain/types/commands/PlatformCommand.js";
import type { CommandKind } from "app/domain/interface/registry/types.js";
import type { HandlerInterface } from "../HandlerInterface.js";

export interface CommandHandlerInterface<K extends CommandKind> extends HandlerInterface<K> {
    buildCommand(): PlatformCommand;
}
