import type { Invocation } from '../Invocation.js';
import type { InvocationKind } from '../InvocationKind.js';

/**
 * Action Invocation
 * Represents an intent to execute a specific functional unit.
 * Decoupled from "commands" terminology to support broader execution types (hooks, jobs).
 */
export interface ActionInvocation<TInput = Record<string, unknown>> extends Invocation {
    readonly kind: Extract<InvocationKind, 'action'>;

    /**
     * The unique identifier of the action to execute.
     * Replaces 'commandName'.
     * E.g. "com.example.actions.ban-user" or just "ban-user".
     */
    readonly actionId: string;

    /**
     * Structured input data for the action.
     * Replaces 'args' or 'options'.
     * Key-value pairs of resolved inputs.
     */
    readonly input: TInput;
}
