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

        if (module.name !== name) {
            console.warn(`Module name mismatch: requested "${name}" but module reports name "${module.name}"`);
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
        module !== null &&
        typeof (module as ModuleInterface).name === "string" &&
        typeof (module as ModuleInterface).migrate === "function" &&
        typeof (module as ModuleInterface).register === "function"
    );
}
