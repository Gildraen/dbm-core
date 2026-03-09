/**
 * Domain abstraction for platform interactions
 */
import type { Interaction } from "app/domain/interface/platform/interactions/Interaction.js";

export type { Interaction };

/**
 * Interaction handler interface for handling platform interactions
 */
export interface InteractionHandler {
    handle(interaction: Interaction): Promise<undefined>;
}

/**
 * Interaction handler strategy - defines how each interaction type should be handled
 */
export interface InteractionHandlerStrategy {
    name: string;
    matches: (interaction: Interaction) => boolean;
    getRegistry: () => Map<string, new () => any>;
    getKey: (interaction: any) => string;
    method: 'execute' | 'handle';
}
