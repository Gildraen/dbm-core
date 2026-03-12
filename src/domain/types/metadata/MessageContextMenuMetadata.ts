import type { BaseMetadata } from "./BaseMetadata.js";

/**
 * Metadata for MessageContextMenu handlers
 */
export type MessageContextMenuMetadata = BaseMetadata & {
    readonly name: string;
};
