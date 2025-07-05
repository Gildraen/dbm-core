import type { ModuleInterface } from "domain/interface/ModuleInterface.js";

export class ModuleLoader {
    public static async load(name: string): Promise<ModuleInterface> {
        try {
            const imported = await import(name);
            const module: unknown = imported.default ?? imported;

            if (!this.isValidModule(module)) {
                throw new Error(`Module "${name}" does not implement ModuleInterface`);
            }

            return module;
        } catch (error) {
            throw new Error(
                `Failed to load module "${name}": ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    private static isValidModule(module: unknown): module is ModuleInterface {
        return (
            typeof module === "object" &&
            module !== null &&
            typeof (module as any).name === "string" &&
            typeof (module as any).migrate === "function"
        );
    }
}
