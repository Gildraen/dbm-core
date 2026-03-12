import type { RoleSelectHandler } from "app/domain/interface/handlers/components/RoleSelectHandler.js";
import type { RoleSelectMetadata } from "app/domain/types/metadata/RoleSelectMetadata.js";
import { registryProvider } from "app/domain/registry/RegistryProvider.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";
import { Keys } from "app/domain/keys/Keys.js";

/**
 * Decorator for role select menu listeners
 * Automatically registers the decorated class for runtime interaction handling
 *
 * @param customId The custom ID of the role select menu component
 */
export function RoleSelect(customId: string) {
    return function <T extends new () => RoleSelectHandler>(target: T): T {
        // Register in the global registry
        const metadata: RoleSelectMetadata = {
            name: target.name,
            customId: customId,
            componentType: 'ROLE_SELECT'
        };

        const registry = registryProvider.getRegistry();
        registry.upsert({
            key: Keys.component({ namespace: 'role-select', id: customId }),
            kind: REGISTRY_KINDS.ROLE_SELECT,
            metadata: metadata,
            handlerClass: target
        });

        return target;
    };
}
