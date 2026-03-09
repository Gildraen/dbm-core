import type { BaseMetadata } from "./BaseMetadata.js";

/**
 * Metadata for SlashCommand handlers
 */
export type SlashCommandMetadata = BaseMetadata & {
    readonly name: string;
    readonly description: string;
};
