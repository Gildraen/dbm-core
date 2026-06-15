import type { ChannelSelectHandler } from "app/domain/interface/handlers/components/ChannelSelectHandler.js";
import { registry } from "app/domain/registry/RegistryProvider.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";
import { Keys } from "app/domain/keys/Keys.js";

/**
 * Decorator for channel select menu listeners
 * Automatically registers the decorated class for handling channel select interactions
 */
export function ChannelSelect(customId: string) {
    return function <T extends new () => ChannelSelectHandler>(target: T): T {
        registry.upsert({
            key: Keys.component({ namespace: 'channel-select', id: customId }),
            kind: REGISTRY_KINDS.CHANNEL_SELECT,
            metadata: { name: target.name, customId, componentType: 'CHANNEL_SELECT' },
            handlerClass: target
        });

        return target;
    };
}
