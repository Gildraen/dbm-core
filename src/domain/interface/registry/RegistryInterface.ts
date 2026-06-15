import type { DescriptorInterface } from "./DescriptorInterface.js";

/**
 * Registry interface for storing and retrieving handler descriptors
 */
export interface RegistryInterface {
    // Write operations
    upsert(descriptor: DescriptorInterface): void;
    remove(key: string): boolean;
    clear(kind?: string): void;

    // Read operations
    get(key: string): DescriptorInterface | undefined;
    list(kind?: string): ReadonlyArray<DescriptorInterface>;
    has(key: string): boolean;
    size(kind?: string): number;
}
