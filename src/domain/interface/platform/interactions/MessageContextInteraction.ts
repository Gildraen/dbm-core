import type { Interaction } from "./Interaction.js";
import type { Message } from "../Message.js";

/**
 * MessageContextInteraction interface - represents a message context menu interaction
 */
export interface MessageContextInteraction extends Interaction {
    readonly targetMessage: Message;
}
