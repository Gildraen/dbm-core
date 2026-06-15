import type { HandlerInterface } from "../HandlerInterface.js";

export interface AutocompleteHandler extends HandlerInterface {
    name: string;
    commandName: string;
}
