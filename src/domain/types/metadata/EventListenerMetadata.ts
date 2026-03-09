import type { BaseMetadata } from "./BaseMetadata.js";

/**
 * Metadata for EventListener handlers
 */
export type EventListenerMetadata = BaseMetadata & {
    readonly name: string;
    readonly eventName?: string;
};
