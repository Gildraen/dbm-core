import type { HandlerInterface } from "../HandlerInterface.js";
import { REGISTRY_KINDS } from "../../registry/types.js";

export interface EventHandler extends HandlerInterface<typeof REGISTRY_KINDS.EVENT> {
    name: string;
}
