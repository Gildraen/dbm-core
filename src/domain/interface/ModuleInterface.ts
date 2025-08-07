import type { MigrationContext } from "app/domain/types/MigrationContext.js";

export interface ModuleInterface {
    name: string;
    migrate?(context: MigrationContext): Promise<unknown>;
    discoverCommands?(): Promise<unknown>;  // Import command decorators (@SlashCommand, @UserContextMenu, etc.)
    discoverListeners?(): Promise<unknown>;  // Import listener decorators (@StringSelectListener, @EventListener, etc.)
    setupHandlers?(): void;   // Optional: For any custom setup logic (rarely needed with decorators)
}
