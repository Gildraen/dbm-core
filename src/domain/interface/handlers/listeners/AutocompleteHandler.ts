import type { HandlerInterface } from "../HandlerInterface.js";
import { REGISTRY_KINDS } from "../../registry/types.js";

export interface AutocompleteHandler extends HandlerInterface<typeof REGISTRY_KINDS.AUTOCOMPLETE> {
    name: string;
    commandName: string;
}
