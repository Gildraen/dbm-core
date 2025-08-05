import type {
    SlashCommand,
    InteractionHandler
} from "app/domain/types/DecoratorInterfaces.js";

/**
 * Central registry for Discord application commands and interaction handlers
 * Used by decorators to automatically register decorated classes
 */

const slashCommands = new Map<string, new () => SlashCommand>();
const interactionHandlers: (new () => InteractionHandler)[] = [];

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

// Interaction Handler Registration
export function registerInteractionHandler(handlerClass: new () => InteractionHandler): void {
    if (interactionHandlers.includes(handlerClass)) {
        console.warn(`⚠️  Interaction handler is already registered. Skipping...`);
        return;
    }
    interactionHandlers.push(handlerClass);
    console.log(`✅ Registered interaction handler: ${handlerClass.name}`);
}

export function getAllInteractionHandlers(): (new () => InteractionHandler)[] {
    return [...interactionHandlers];
}

export function clearInteractionHandlers(): void {
    interactionHandlers.length = 0;
}

// Registry Management
export function clearDiscordRegistry(): void {
    clearSlashCommands();
    clearInteractionHandlers();
    console.log("🧹 Cleared all Discord registrations");
}

export function getDiscordRegistrationSummary(): {
    slashCommands: number;
    interactionHandlers: number;
    total: number;
} {
    return {
        slashCommands: slashCommands.size,
        interactionHandlers: interactionHandlers.length,
        total: slashCommands.size + interactionHandlers.length
    };
}
