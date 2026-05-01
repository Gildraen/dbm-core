import type { Invocation } from '../Invocation.js';
import type { InvocationKind } from '../InvocationKind.js';

/**
 * Message Invocation
 * Represents a communication event in a conversation context.
 * Decoupled from specific "chat" terminology.
 */
export interface MessageInvocation extends Invocation {
    readonly kind: Extract<InvocationKind, 'message'>;

    /**
     * The content of the message.
     * Can be text or structured data depending on the provider.
     */
    readonly content: string;

    /**
     * The identity of the entity that produced the message.
     * Replaces 'authorId'.
     */
    readonly actorId: string;

    /**
     * The identifier of the conversation context.
     * Replaces 'channelId'.
     * Could be a channel, thread, ticket, or DM session.
     */
    readonly conversationId: string;
}
