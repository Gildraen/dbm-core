import type { PrismaClient } from "@prisma/client";
import type { MigrationRepository } from "app/domain/interface/MigrationRepository.js";

export class PrismaMigrationRepository implements MigrationRepository {
    private readonly prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    getPrismaClient(): PrismaClient {
        return this.prisma;
    }
}
