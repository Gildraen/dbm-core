import type { PlatformTextMessage } from "./PlatformTextMessage.js";

/**
 * Text channel interface for platform events
 */
export interface PlatformTextChannel {
    readonly send: (content: { content: string }) => Promise<PlatformTextMessage>;
}
