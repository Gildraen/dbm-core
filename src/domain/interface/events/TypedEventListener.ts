import type { PlatformEventKey } from "app/domain/types/events/PlatformEventKey.js";
import type { PlatformEventArgs } from "app/domain/types/events/PlatformEventArgs.js";

/**
 * Typed event listener interface
 */
export interface TypedEventListener<K extends PlatformEventKey> {
    handle(...args: PlatformEventArgs<K>): Promise<unknown>;
}
