import type { DescriptorInterface } from "./DescriptorInterface.js";
import type { RegistryKey, Kind } from "./types.js";

/**
 * Write access to platform registry
 */
export interface PlatformRegistryWriterInterface {
    /**
     * Insert or update descriptor
     */
    upsert<K extends Kind = Kind>(descriptor: DescriptorInterface<K>): void;

    /**
     * Remove descriptor by key
     */
    remove(key: RegistryKey): boolean;

    /**
     * Clear all descriptors, optionally filtered by kind
     */
    clear(kind?: Kind): void;
}
