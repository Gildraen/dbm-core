/**
 * Registry provider - manages registry lifecycle and access
 * Object-oriented approach with singleton instance for convenience
 */

import type { PlatformRegistryInterface } from "app/domain/interface/registry/PlatformRegistryInterface.js";

/**
 * Manages the registry instance lifecycle
 * Provides controlled access to the configured registry
 */
export class RegistryProvider {
    private registry: PlatformRegistryInterface | null = null;

    /**
     * Configure the registry instance
     * Can only be called once unless reset() is called first
     */
    configure(registry: PlatformRegistryInterface): void {
        if (this.registry) {
            throw new Error("Registry already configured. Call reset() first if you need to reconfigure.");
        }
        this.registry = registry;
        console.log(`✅ Registry configured: ${registry.constructor.name}`);
    }

    /**
     * Get the configured registry instance
     * Throws if registry hasn't been configured yet
     */
    getRegistry(): PlatformRegistryInterface {
        if (!this.registry) {
            throw new Error(
                "Registry not configured. Call RegistryProvider.configure() during application bootstrap."
            );
        }
        return this.registry;
    }

    /**
     * Reset the registry (useful for testing)
     * Allows reconfiguration after reset
     */
    reset(): void {
        this.registry = null;
        console.log("🔄 Registry reset");
    }

    /**
     * Check if registry has been configured
     */
    isConfigured(): boolean {
        return this.registry !== null;
    }
}

/**
 * Global registry provider instance
 * This is the singleton used throughout the application
 */
export const registryProvider = new RegistryProvider();
