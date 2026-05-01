import type { InvocationKind } from './InvocationKind.js';

/**
 * Base Invocation interface
 * Represents a provider-agnostic execution trigger.
 * Focuses on identifying "what happened" minimally.
 */
export interface Invocation {
    /**
     * Unique identifier for this specific invocation instance.
     * Providers should map their event ID to this.
     */
    readonly id: string;

    /**
     * The kind of invocation (Action, Message, Signal, or Submission).
     * Used for routing to appropriate handlers.
     */
    readonly kind: InvocationKind;

    /**
     * The timestamp when the invocation occurred.
     */
    readonly occurredAt: Date;
}
