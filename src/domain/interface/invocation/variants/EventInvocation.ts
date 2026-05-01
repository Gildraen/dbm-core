import type { Invocation } from '../Invocation.js';
import type { InvocationKind } from '../InvocationKind.js';

/**
 * Event Invocation
 * Represents a discrete logical event in the system.
 * More generic than "signal", suitable for both UI interactions and system events.
 */
export interface EventInvocation<TPayload = Record<string, unknown>> extends Invocation {
    readonly kind: Extract<InvocationKind, 'event'>;

    /**
     * The logical type of the event.
     * E.g. "ui.button.click", "system.ready", "member.joined".
     * Replaces 'signalId' / 'customId'.
     */
    readonly eventType: string;

    /**
     * Normalized event data.
     * Guaranteed to be a plain object, devoid of provider-specific SDK instances.
     */
    readonly payload: TPayload;
}
