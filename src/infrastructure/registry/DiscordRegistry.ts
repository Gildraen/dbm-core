import type {
    SlashCommand,
    InteractionListener
} from "app/domain/types/DecoratorInterfaces.js";

/**
 * Central registry for Discord application commands and interaction listeners
 * Used by decorators to automatically register decorated classes
 */

const slashCommands = new Map<string, new () => SlashCommand>();
const interactionListeners: (new () => InteractionListener)[] = [];

// Slash Command Registration
export function registerSlashCommand(name: string, commandClass: new () => SlashCommand): void {
    if (slashCommands.has(name)) {
        console.warn(`⚠️  Slash command '${name}' is already registered. Overwriting...`);
    }
    slashCommands.set(name, commandClass);
    console.log(`✅ Registered slash command: ${name}`);
}

export function getAllSlashCommands(): Map<string, new () => SlashCommand> {
    return new Map(slashCommands);
}

export function getSlashCommand(name: string): (new () => SlashCommand) | undefined {
    return slashCommands.get(name);
}

export function clearSlashCommands(): void {
    slashCommands.clear();
}

// Interaction Listener Registration
export function registerInteractionListener(listenerClass: new () => InteractionListener): void {
    if (interactionListeners.includes(listenerClass)) {
        console.warn(`⚠️  Interaction listener is already registered. Skipping...`);
        return;
    }
    interactionListeners.push(listenerClass);
    console.log(`✅ Registered interaction listener: ${listenerClass.name}`);
}

export function getAllInteractionListeners(): (new () => InteractionListener)[] {
    return [...interactionListeners];
}

export function clearInteractionListeners(): void {
    interactionListeners.length = 0;
}

// Registry Management
export function clearDiscordRegistry(): void {
    clearSlashCommands();
    clearInteractionListeners();
    console.log("🧹 Cleared all Discord registrations");
}

export function getDiscordRegistrationSummary(): {
    slashCommands: number;
    interactionListeners: number;
    total: number;
} {
    return {
        slashCommands: slashCommands.size,
        interactionListeners: interactionListeners.length,
        total: slashCommands.size + interactionListeners.length
    };
}
