import type { PlatformRegistryReaderInterface } from "./PlatformRegistryReaderInterface.js";
import type { PlatformRegistryWriterInterface } from "./PlatformRegistryWriterInterface.js";

/**
 * Combined read/write access to platform registry
 */
export interface PlatformRegistryInterface extends PlatformRegistryReaderInterface, PlatformRegistryWriterInterface { }
