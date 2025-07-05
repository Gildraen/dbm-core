import { type ModuleInterface } from "domain/interface/ModuleInterface.js";

class Migrator {
    private static instance: Migrator;

    private modules: ModuleInterface[] = [];

    private constructor() { }


    public static getInstance(): Migrator {
        if (!Migrator.instance) {
            Migrator.instance = new Migrator();
        }
        return Migrator.instance;
    }

    public registerModule(module: ModuleInterface): void {
        this.modules.push(module);
    }

    private generateMigrationName(moduleName: string): string {
        const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
        return `${timestamp}_${moduleName}`;
    }

    public async migrateModules(): Promise<void> {
        for (const mod of this.modules) {
            const migrationName = this.generateMigrationName(mod.name);
            await mod.migrate();
        }
    }
}

export default Migrator.getInstance();