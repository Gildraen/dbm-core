import type { MigrationContext } from "app/domain/types/MigrationContext.js";
import type { RegisterContext } from "app/domain/types/RegisterContext.js";
import type { Client } from "discord.js";

export interface ModuleInterface {
    name: string;
    migrate?(context: MigrationContext): Promise<unknown>;
    register?(context: RegisterContext): Promise<unknown>;
    setupHandlers?(client: Client): void;
}
