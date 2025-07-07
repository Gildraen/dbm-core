export interface ModuleInterface {
    name: string;
    migrate(): Promise<unknown>;
}
