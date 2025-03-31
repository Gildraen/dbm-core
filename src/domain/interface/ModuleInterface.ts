export default interface ModuleInterface {
    name: string;
    migrate(migrationName: string): Promise<void>;
}