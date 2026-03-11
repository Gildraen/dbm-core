import type { Kind, KindHandleArgsMap } from "../registry/types.js";

/**
 * Base interface that all handler classes must implement
 * This provides a common contract for all decorators (SlashCommand, EventListener, etc.)
 *
 * Generic type K allows TypeScript to infer the exact parameter types for handle()
 */
export interface HandlerInterface<K extends Kind = Kind> {
    /**
     * The name/identifier of the handler
     */
    readonly name: string;

    /**
     * Handle the interaction or event with type-safe parameters
     *
     * @param args - Type-safe parameters based on handler kind (via KindHandleArgsMap)
     *               - For interaction handlers: single typed Interaction parameter
     *               - For event handlers: variable event-specific parameters
     * @returns Promise that resolves when handling is complete
     *          Return value is typically unused (handlers perform side effects)
     */
    handle(...args: KindHandleArgsMap[K]): Promise<unknown>;
}
