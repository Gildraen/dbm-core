import type { MigrationContext } from "app/domain/interface/migration/MigrationContext.js";

export interface ModuleInterface {
    name: string;
    migrate?(context: MigrationContext): Promise<unknown>;
    discoverCommands?(): Promise<unknown>;
    discoverListeners?(): Promise<unknown>;
}
