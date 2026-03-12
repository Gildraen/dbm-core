import type { HandlerInterface } from "../HandlerInterface.js";
import { REGISTRY_KINDS } from "../../registry/types.js";

export interface ChannelSelectHandler extends HandlerInterface<typeof REGISTRY_KINDS.CHANNEL_SELECT> {
    customId: string;
}
