import type { CommandHandlerInterface } from "../HandlerInterface.js";

export interface SlashCommandHandler extends CommandHandlerInterface {
    name: string;
    description: string;
}
