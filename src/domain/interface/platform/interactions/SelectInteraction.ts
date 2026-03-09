import type { Interaction } from "./Interaction.js";

/**
 * SelectInteraction interface - represents a select menu interaction
 */
export interface SelectInteraction extends Interaction {
    readonly customId: string;
    readonly values: string[];
}
