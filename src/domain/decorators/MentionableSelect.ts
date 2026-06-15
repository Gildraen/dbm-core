import type { MentionableSelectHandler } from "app/domain/interface/handlers/components/MentionableSelectHandler.js";
import { registry } from "app/domain/registry/RegistryProvider.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";
import { Keys } from "app/domain/keys/Keys.js";

/**
 * Decorator for mentionable select menu listeners
 * Automatically registers the decorated class for handling mentionable select interactions
 */
export function MentionableSelect(customId: string) {
    return function <T extends new () => MentionableSelectHandler>(target: T): T {
        registry.upsert({
            key: Keys.component({ namespace: 'mentionable-select', id: customId }),
            kind: REGISTRY_KINDS.MENTIONABLE_SELECT,
            metadata: { name: target.name, customId, componentType: 'MENTIONABLE_SELECT' },
            handlerClass: target
        });

        return target;
    };
}
