import { PrismaClient } from "@prisma/client";

export type MigrationContext = {
    prisma: PrismaClient;
    dryRun: boolean;
};