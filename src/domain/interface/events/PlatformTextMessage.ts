/**
 * Text message interface for platform events
 */
export interface PlatformTextMessage {
    readonly content: { content: string };
    readonly reply: (content: { content: string }) => Promise<PlatformTextMessage>;
}
