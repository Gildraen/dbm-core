import type { Interaction } from "../InteractionHandler.js";

/**
 * Base interface for all interaction handler classes
 */
export interface HandlerInterface {
    handle(interaction: Interaction): Promise<unknown>;
}

/**
 * Command handler interface - adds buildCommand for command registration
 */
export interface CommandHandlerInterface extends HandlerInterface {
    buildCommand(): Record<string, unknown>;
}

/**
 * Event handler interface - accepts variable args for platform events
 */
export interface EventHandlerInterface {
    handle(...args: unknown[]): Promise<unknown>;
}
