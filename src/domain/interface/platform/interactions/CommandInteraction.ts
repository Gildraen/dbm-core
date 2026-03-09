import type { Interaction } from "./Interaction.js";
import type { CommandOptions } from "../CommandOptions.js";

/**
 * CommandInteraction interface - represents a slash command interaction
 */
export interface CommandInteraction extends Interaction {
    readonly commandName: string;
    readonly options: CommandOptions;
}
