import type { HandlerInterface } from "../HandlerInterface.js";
import { REGISTRY_KINDS } from "../../registry/types.js";

export interface StringSelectHandler extends HandlerInterface<typeof REGISTRY_KINDS.STRING_SELECT> {
    customId: string;
}
