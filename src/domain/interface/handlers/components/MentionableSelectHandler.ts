import type { HandlerInterface } from "../HandlerInterface.js";
import { REGISTRY_KINDS } from "../../registry/types.js";

export interface MentionableSelectHandler extends HandlerInterface<typeof REGISTRY_KINDS.MENTIONABLE_SELECT> {
    customId: string;
}
