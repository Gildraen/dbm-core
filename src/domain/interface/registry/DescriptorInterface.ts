import type { RegistryKey, Kind, KindMetadataMap, KindHandlerMap } from "./types.js";

/**
 * Descriptor that holds handler registration information
 * Generic type K ensures that metadata and handler type match the kind
 */
export interface DescriptorInterface<K extends Kind = Kind> {
    readonly key: RegistryKey;
    readonly kind: K;
    readonly metadata: KindMetadataMap[K];
    readonly handlerClass: new () => KindHandlerMap[K];
}
