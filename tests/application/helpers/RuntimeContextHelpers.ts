import { DomainRegistry } from "app/domain/registry/DomainRegistry.js";
import type { RuntimeContext } from "app/application/interface/RuntimeContext.js";

/**
 * Create an isolated RuntimeContext for testing.
 * Each call returns a fresh context with its own registry instance.
 *
 * @returns A new RuntimeContext with an isolated DomainRegistry
 *
 * @example
 * ```typescript
 * const context = createIsolatedContext();
 * const useCase = new RegisterCommands(repository, context);
 * await useCase.execute();
 * clearContext(context); // Clean up after test
 * ```
 */
export function createIsolatedContext(): RuntimeContext {
    return {
        registry: new DomainRegistry(),
    };
}

/**
 * Clear all entries in a context's registry.
 * Use this in test teardown to prevent state leakage between tests.
 *
 * @param context The RuntimeContext to clear
 *
 * @example
 * ```typescript
 * afterEach(() => {
 *     clearContext(context);
 * });
 * ```
 */
export function clearContext(context: RuntimeContext): void {
    context.registry.clear();
}
