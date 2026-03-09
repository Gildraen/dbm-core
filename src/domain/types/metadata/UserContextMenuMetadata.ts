import type { BaseMetadata } from "./BaseMetadata.js";

/**
 * Metadata for UserContextMenu handlers
 */
export type UserContextMenuMetadata = BaseMetadata & {
    readonly name: string;
};
