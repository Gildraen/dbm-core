import type { HandlerInterface } from "../HandlerInterface.js";
import { REGISTRY_KINDS } from "../../registry/types.js";

export interface RoleSelectHandler extends HandlerInterface<typeof REGISTRY_KINDS.ROLE_SELECT> {
    customId: string;
}
