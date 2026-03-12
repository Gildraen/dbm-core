import type { BaseMetadata } from "./BaseMetadata.js";
import type { PlatformEventKey } from "app/domain/types/events/PlatformEventKey.js";

/**
 * Metadata for EventListener handlers
 */
export type EventListenerMetadata = BaseMetadata & {
    readonly name: string;
    readonly eventName: PlatformEventKey;
    readonly once?: boolean;
};
