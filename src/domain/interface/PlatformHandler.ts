/**
 * Base interface for all platform handlers
 * Provides a generic way to invoke handler methods without type casting
 */
export interface PlatformHandler {
    /**
     * Generic method invocation
     * Each handler implements this to delegate to their specific method (execute, handle, autocomplete)
     */
    invoke(methodName: string, ...args: unknown[]): Promise<unknown>;
}

/**
 * Base class that handlers can extend for convenience
 * Provides default implementation of the invoke method
 */
export abstract class BasePlatformHandler implements PlatformHandler {
    /**
     * Default implementation that calls the specified method if it exists
     */
    async invoke(methodName: string, ...args: unknown[]): Promise<unknown> {
        const method = (this as any)[methodName];
        if (typeof method === 'function') {
            return method.apply(this, args);
        } else {
            throw new Error(`Method ${methodName} not found on ${this.constructor.name}`);
        }
    }
}
