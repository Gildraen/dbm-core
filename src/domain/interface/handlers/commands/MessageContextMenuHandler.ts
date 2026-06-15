import type { CommandHandlerInterface } from "../HandlerInterface.js";

export interface MessageContextMenuHandler extends CommandHandlerInterface {
    name: string;
}
