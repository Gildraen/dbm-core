import { config } from 'domain/config/Config.js';

export default class StartMigration {

    async execute() {
        const modules = config.modules;

        for (const module of modules) {
            if (module.enabled) {
                const moduleName = await import(module.name);
                console.log(moduleName);
                console.log(`Starting migration for module: ${module.name}`);
                // Perform migration logic here
                // For example, you could call a migration function specific to the module
                // await migrateModule(module);
            } else {
                console.log(`Module ${module.name} is disabled. Skipping migration.`);
            }
        }
    }
}