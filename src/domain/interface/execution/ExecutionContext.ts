/**
 * ExecutionContext represents the runtime environment for a Handler.
 * It provides capabilities and context to the executing logic,
 * decoupling it from global state or provider-specific resources.
 */
export interface ExecutionContext {
    /**
     * Unique identifier for the current execution trace/request.
     * Useful for correlation across logs and async operations.
     */
    readonly executionId: string;

    /**
     * Timestamp when execution started.
     */
    readonly startedAt: Date;

    // Minimum viable context.
    // Future extensions:
    // - logger: Logger
    // - config: Config
    // - capabilities: CapabilitySet
}
