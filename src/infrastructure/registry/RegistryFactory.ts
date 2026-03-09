/**
 * Factory for creating registry instances based on configuration
 */

import type { PlatformRegistryInterface } from "app/domain/interface/registry/PlatformRegistryInterface.js";
import type { RegistryConfigType } from "app/domain/config/ConfigSchema.js";
import { RegistryType } from "app/domain/config/ConfigSchema.js";
import { InMemoryRegistry } from "app/infrastructure/inmemory/registry/InMemoryRegistry.js";

/**
 * Creates the appropriate registry implementation based on configuration
 */
export function createRegistry(config: RegistryConfigType): PlatformRegistryInterface {
    switch (config.type) {
        case RegistryType.IN_MEMORY:
            return new InMemoryRegistry();
        
        case RegistryType.DISCORD:
            throw new Error('Discord registry not yet implemented');
            // TODO: Implement DiscordRegistry that stores/syncs with Discord's API
            // return new DiscordRegistry();
        
        default:
            // TypeScript will catch this at compile time due to exhaustive checking
            const exhaustiveCheck: never = config.type;
            throw new Error(`Unknown registry type: ${exhaustiveCheck}`);
    }
}
