/**
 * Context for migration operations
 * Contains information about the current migration state
 */
export interface MigrationContext {
    readonly version: string;
    readonly timestamp: number;
    readonly description?: string;
}
