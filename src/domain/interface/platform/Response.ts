/**
 * Response interface - defines a response structure for interactions
 */
export interface Response {
    content?: string;
    ephemeral?: boolean;
    embeds?: unknown[];
    components?: unknown[];
    files?: unknown[];
    suppressEmbeds?: boolean;
    tts?: boolean;
}
