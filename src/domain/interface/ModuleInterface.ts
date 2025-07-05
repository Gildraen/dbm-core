export interface ModuleInterface {
    name: string;
    migrate(): Promise<void>;
}
