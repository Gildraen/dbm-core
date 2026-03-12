import type { MentionableSelectHandler } from "app/domain/interface/handlers/components/MentionableSelectHandler.js";
import type { MentionableSelectMetadata } from "app/domain/types/metadata/MentionableSelectMetadata.js";
import { registryProvider } from "app/domain/registry/RegistryProvider.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";
import { Keys } from "app/domain/keys/Keys.js";

/**
 * Decorator for mentionable select menu listeners
 * Automatically registers the decorated class for handling mentionable select interactions
 */
export function MentionableSelect(customId: string) {
    return function <T extends new () => MentionableSelectHandler>(target: T): T {
        // Register in the global registry
        const metadata: MentionableSelectMetadata = {
            name: target.name,
            customId: customId,
            componentType: 'MENTIONABLE_SELECT'
        };

        const registry = registryProvider.getRegistry();
        registry.upsert({
            key: Keys.component({ namespace: 'mentionable-select', id: customId }),
            kind: REGISTRY_KINDS.MENTIONABLE_SELECT,
            metadata: metadata,
            handlerClass: target
        });

        return target;
    };
}
