import type { AutocompleteInteraction } from "app/domain/interface/platform/interactions/AutocompleteInteraction.js";

export interface AutocompleteListener {
    commandName: string;
    handle(interaction: AutocompleteInteraction): Promise<unknown>;
}
