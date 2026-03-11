/**
 * Generic migration repository interface
 * Abstracts database connection management for migrations
 */
export interface MigrationRepository {
    /** Get the database client - generic type for flexibility */
    getDatabaseClient(): unknown;

    /** Get connection info/metadata if needed */
    getConnectionInfo?(): Record<string, unknown>;

    /** Clean up resources */
    disconnect?(): Promise<void>;
}

/**
 * Prisma-specific migration repository
 * Use this when you need Prisma-specific functionality
 */
export interface PrismaMigrationRepository extends MigrationRepository {
    getDatabaseClient(): import("@prisma/client").PrismaClient;
}
