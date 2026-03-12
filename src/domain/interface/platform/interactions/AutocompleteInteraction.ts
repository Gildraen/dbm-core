import type { Interaction } from "./Interaction.js";

/**
 * AutocompleteInteraction interface - represents an autocomplete interaction
 */
export interface AutocompleteInteraction extends Interaction {
    readonly commandName: string;
    readonly focusedOption: { name: string; value: string };
    respond(choices: Array<{ name: string; value: string }>): Promise<unknown>;
}
