import type { Invocation } from "../invocation/Invocation.js";
import type { ExecutionContext } from "../execution/ExecutionContext.js";

/**
 * A Handler is the atomic unit of execution in the runtime.
 * It processes a normalized Invocation within a given ExecutionContext.
 *
 * Handlers must be:
 * - Stateless (logic only, no instance state)
 * - Provider-agnostic (depend only on Invocation/Context interfaces)
 * - Deterministic (same input + same context = same result)
 */
export interface Handler<TInput extends Invocation = Invocation, TOutput = unknown> {
    /**
     * Executes the handler logic.
     *
     * @param invocation The normalized input describing what happened.
     * @param context The runtime environment providing capabilities.
     * @returns A promise resolving to the execution result.
     */
    handle(invocation: TInput, context: ExecutionContext): Promise<TOutput>;
}
