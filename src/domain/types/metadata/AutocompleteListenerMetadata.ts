import type { BaseMetadata } from "./BaseMetadata.js";

/**
 * Metadata for AutocompleteListener handlers
 */
export type AutocompleteListenerMetadata = BaseMetadata & {
    readonly name: string;
    readonly commandName: string;
};
