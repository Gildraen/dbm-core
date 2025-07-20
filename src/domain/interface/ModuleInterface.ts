import type { MigrationContext } from "app/domain/types/MigrationContext.js";

export interface ModuleInterface {
    name: string;
    migrate(ctx: MigrationContext): Promise<unknown>;
}
