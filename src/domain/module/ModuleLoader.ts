import type { ModuleInterface } from "app/domain/interface/ModuleInterface.js";

export async function loadModule(name: string): Promise<ModuleInterface> {
    try {
        const importedModule: unknown = await import(name);
        const module = (importedModule && typeof importedModule === "object" && "default" in importedModule)
            ? (importedModule as { default: unknown }).default
            : importedModule;
        if (!isValidModule(module)) {
            throw new Error(`Module "${name}" does not implement ModuleInterface`);
        }

        return module;
    } catch (error) {
        throw new Error(
            `Failed to load module "${name}": ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

function isValidModule(module: unknown): module is ModuleInterface {
    return (
        typeof module === "object" &&
        typeof (module as ModuleInterface).name === "string" &&
        typeof (module as ModuleInterface).migrate === "function"
    );
}
