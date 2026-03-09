import type { DescriptorInterface } from "./DescriptorInterface.js";
import type { RegistryKey, Kind } from "./types.js";

/**
 * Read-only access to platform registry
 */
export interface PlatformRegistryReaderInterface {
    /**
     * Get descriptor by key
     */
    get<K extends Kind = Kind>(key: RegistryKey): DescriptorInterface<K> | undefined;

    /**
     * List all descriptors, optionally filtered by kind
     */
    list<K extends Kind = Kind>(kind?: K): ReadonlyArray<DescriptorInterface<K>>;

    /**
     * Check if a key exists in registry
     */
    has(key: RegistryKey): boolean;

    /**
     * Get registry size, optionally filtered by kind
     */
    size(kind?: Kind): number;
}
