import type { RegistryInterface } from "app/domain/interface/registry/RegistryInterface.js";

/**
 * Runtime context passed through the application layer.
 * Carries the registry instance for a given execution lifecycle
 * (CLI registration, bot runtime, or test).
 *
 * Replaces implicit access to the global registry singleton.
 */
export interface RuntimeContext {
    registry: RegistryInterface;
}
