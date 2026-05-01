import type { Invocation } from '../Invocation.js';
import type { InvocationKind } from '../InvocationKind.js';

/**
 * Submission Invocation
 * Represents a data submission event.
 * Decoupled from "modals" or specific UI forms.
 */
export interface SubmissionInvocation<TPayload = Record<string, unknown>> extends Invocation {
    readonly kind: Extract<InvocationKind, 'submission'>;

    /**
     * Identifier for the submission target/schema.
     * Replaces 'formId' or 'customId'.
     */
    readonly submissionId: string;

    /**
     * The submitted data payload.
     * Replaces 'data'.
     */
    readonly payload: TPayload;
}
