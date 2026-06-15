import { REGISTRY_KINDS } from "../registry/types.js";
import type { HandlerInterface, EventHandlerInterface } from "../handlers/HandlerInterface.js";
import type { Kind, RegistryKey } from "../registry/types.js";

/**
 * Descriptor for interaction-based handlers (commands, components, autocomplete)
 */
export interface InteractionDescriptorInterface {
    readonly key: RegistryKey;
    readonly kind: Kind;
    readonly metadata: Record<string, unknown>;
    readonly handlerClass: new () => HandlerInterface;
}

/**
 * Descriptor for event-based handlers
 */
export interface EventDescriptorInterface {
    readonly key: RegistryKey;
    readonly kind: typeof REGISTRY_KINDS.EVENT;
    readonly metadata: Record<string, unknown>;
    readonly handlerClass: new () => EventHandlerInterface;
}

export type DescriptorInterface = InteractionDescriptorInterface | EventDescriptorInterface;

export function isEventDescriptor(d: DescriptorInterface): d is EventDescriptorInterface {
    return d.kind === REGISTRY_KINDS.EVENT;
}
