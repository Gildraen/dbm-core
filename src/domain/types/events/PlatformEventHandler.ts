import type { PlatformEventKey } from "./PlatformEventKey.js";
import type { PlatformEventArgs } from "./PlatformEventArgs.js";

/**
 * Platform event handler type
 */
export type PlatformEventHandler<K extends PlatformEventKey> = (
    ...args: PlatformEventArgs<K>
) => Promise<unknown>;
