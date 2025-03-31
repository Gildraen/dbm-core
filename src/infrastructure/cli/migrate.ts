import StartMigration from "@application/useCase/StartMigration.js";

class MigrateCLI {
    public run(): void {
        const startMigration = new StartMigration();
        startMigration.execute();
    }
}

new MigrateCLI().run();