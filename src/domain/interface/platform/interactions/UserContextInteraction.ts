import type { Interaction } from "./Interaction.js";
import type { User } from "../User.js";

/**
 * UserContextInteraction interface - represents a user context menu interaction
 */
export interface UserContextInteraction extends Interaction {
    readonly targetUser: User;
}
