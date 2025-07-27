import type { PrismaClient } from "@prisma/client";

export interface MigrationRepository {
    getPrismaClient(): PrismaClient;
}
