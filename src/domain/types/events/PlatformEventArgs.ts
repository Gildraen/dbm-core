import type { PlatformEvents } from "app/domain/interface/events/PlatformEvents.js";
import type { PlatformEventKey } from "./PlatformEventKey.js";

/**
 * Platform event arguments type
 */
export type PlatformEventArgs<K extends PlatformEventKey> = PlatformEvents[K];
