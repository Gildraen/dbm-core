import type { ChannelSelectHandler } from "app/domain/interface/handlers/components/ChannelSelectHandler.js";
import type { ChannelSelectMetadata } from "app/domain/types/metadata/ChannelSelectMetadata.js";
import { registryProvider } from "app/domain/registry/RegistryProvider.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";
import { Keys } from "app/domain/keys/Keys.js";

/**
 * Decorator for channel select menu listeners
 * Automatically registers the decorated class for handling channel select interactions
 */
export function ChannelSelect(customId: string) {
    return function <T extends new () => ChannelSelectHandler>(target: T): T {
        // Register in the global registry
        const metadata: ChannelSelectMetadata = {
            name: target.name,
            customId: customId,
            componentType: 'CHANNEL_SELECT'
        };

        const registry = registryProvider.getRegistry();
        registry.upsert({
            key: Keys.component({ namespace: 'channel-select', id: customId }),
            kind: REGISTRY_KINDS.CHANNEL_SELECT,
            metadata: metadata,
            handlerClass: target
        });

        return target;
    };
}
