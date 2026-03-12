import type { HandlerInterface } from "../HandlerInterface.js";
import { REGISTRY_KINDS } from "../../registry/types.js";

export interface UserSelectHandler extends HandlerInterface<typeof REGISTRY_KINDS.USER_SELECT> {
    customId: string;
}
