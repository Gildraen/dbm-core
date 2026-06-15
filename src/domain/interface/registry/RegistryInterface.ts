import type { DescriptorInterface } from "./DescriptorInterface.js";
import type { Kind, RegistryKey } from "./types.js";

/**
 * Registry interface for storing and retrieving handler descriptors
 */
export interface RegistryInterface {
    // Write operations
    upsert(descriptor: DescriptorInterface): void;
    remove(key: RegistryKey): boolean;
    clear(kind?: Kind): void;

    // Read operations
    get(key: RegistryKey): DescriptorInterface | undefined;
    list(kind?: Kind): ReadonlyArray<DescriptorInterface>;
    has(key: RegistryKey): boolean;
    size(kind?: Kind): number;
}
