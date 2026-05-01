import type { Invocation } from '../Invocation.js';
import type { InvocationKind } from '../InvocationKind.js';

/**
 * Signal Invocation
 * Represents a lightweight signal or state change event.
 * Decoupled from specific UI components (buttons, selects).
 */
export interface SignalInvocation extends Invocation {
    readonly kind: Extract<InvocationKind, 'signal'>;

    /**
     * Identifier for the signal.
     * Replaces 'customId'.
     */
    readonly signalId: string;

    /**
     * Optional payload associated with the signal.
     * Replaces 'values' and component-specific properties.
     * Can contain selected values, toggle states, or other signal data.
     */
    readonly payload?: Record<string, unknown> | unknown[];
}
