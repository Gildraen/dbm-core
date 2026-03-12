/**
 * Registry provider - manages registry lifecycle and access.
 */

import type { PlatformRegistryInterface } from "app/domain/interface/registry/PlatformRegistryInterface.js";

/**
 * Manages the registry instance lifecycle.
 */
export class RegistryProvider {
    private registry: PlatformRegistryInterface | null = null;

    configure(registry: PlatformRegistryInterface): void {
        if (this.registry) {
            throw new Error("Registry already configured. Call reset() first if you need to reconfigure.");
        }
        this.registry = registry;
        console.log(`✅ Registry configured: ${registry.constructor.name}`);
    }

    getRegistry(): PlatformRegistryInterface {
        if (!this.registry) {
            throw new Error(
                "Registry not configured. Call RegistryProvider.configure() during application bootstrap."
            );
        }
        return this.registry;
    }

    reset(): void {
        this.registry = null;
        console.log("🔄 Registry reset");
    }

    isConfigured(): boolean {
        return this.registry !== null;
    }
}

/**
 * Global registry provider singleton.
 */
export const registryProvider = new RegistryProvider();
