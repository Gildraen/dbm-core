/**
 * Represents the type of invocation that occurred.
 * Provider-agnostic classification of events.
 */
export const INVOCATION_KINDS = {
    /**
     * Accion invocation (e.g. Slash Command, User Command)
     * Represents an intent to perform a specific named operation.
     */
    ACTION: 'action',

    /**
     * Message invocation (e.g. Chat Message)
     * Represents a communication event that might trigger a response.
     */
    MESSAGE: 'message',

    /**
     * Event invocation (e.g. Button click, Select menu, custom events)
     * Represents a discrete event that occurred in the system.
     */
    EVENT: 'event',

    /**
     * Submission invocation (e.g. Modal submit)
     * Represents a data submission event.
     */
    SUBMISSION: 'submission'
} as const;

export type InvocationKind = typeof INVOCATION_KINDS[keyof typeof INVOCATION_KINDS];
