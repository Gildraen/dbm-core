import { REGISTRY_KINDS } from "../registry/types.js";
import type { HandlerInterface, EventHandlerInterface } from "../handlers/HandlerInterface.js";

/**
 * Descriptor for interaction-based handlers (commands, components, autocomplete)
 */
export interface InteractionDescriptorInterface {
    readonly key: string;
    readonly kind: string;
    readonly metadata: Record<string, unknown>;
    readonly handlerClass: new () => HandlerInterface;
}

/**
 * Descriptor for event-based handlers
 */
export interface EventDescriptorInterface {
    readonly key: string;
    readonly kind: typeof REGISTRY_KINDS.EVENT;
    readonly metadata: Record<string, unknown>;
    readonly handlerClass: new () => EventHandlerInterface;
}

export type DescriptorInterface = InteractionDescriptorInterface | EventDescriptorInterface;

export function isEventDescriptor(d: DescriptorInterface): d is EventDescriptorInterface {
    return d.kind === REGISTRY_KINDS.EVENT;
}
