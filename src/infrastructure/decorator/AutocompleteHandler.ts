import type { AutocompleteHandler } from "app/domain/types/DecoratorInterfaces.js";

// Autocomplete Handler Registry
const autocompleteHandlers = new Map<string, new () => AutocompleteHandler>();

// Registry functions
export function registerAutocompleteHandler(commandName: string, handlerClass: new () => AutocompleteHandler): void {
    if (autocompleteHandlers.has(commandName)) {
        console.warn(`⚠️  Autocomplete handler for '${commandName}' is already registered. Overwriting...`);
    }
    autocompleteHandlers.set(commandName, handlerClass);
    console.log(`✅ Registered autocomplete handler for command: ${commandName}`);
}

export function getAllAutocompleteHandlers(): Map<string, new () => AutocompleteHandler> {
    return new Map(autocompleteHandlers);
}

export function getAutocompleteHandler(commandName: string): (new () => AutocompleteHandler) | undefined {
    return autocompleteHandlers.get(commandName);
}

export function clearAutocompleteHandlers(): void {
    autocompleteHandlers.clear();
    console.log("🧹 Cleared all autocomplete handler registrations");
}

/**
 * Decorator for Discord autocomplete handlers
 * Automatically registers the decorated class for providing command parameter suggestions
 *
 * @param commandName The name of the command to provide autocomplete for
 *
 * @example
 * ```typescript
 * @AutocompleteHandler('music')
 * export class MusicAutocomplete implements AutocompleteHandler {
 *     commandName = 'music';
 *
 *     async handle(interaction: AutocompleteInteraction): Promise<void> {
 *         const focusedValue = interaction.options.getFocused();
 *         const choices = [
 *             { name: 'Rock', value: 'rock' },
 *             { name: 'Pop', value: 'pop' },
 *             { name: 'Jazz', value: 'jazz' }
 *         ].filter(choice => choice.name.toLowerCase().includes(focusedValue.toLowerCase()));
 *
 *         await interaction.respond(choices);
 *     }
 * }
 * ```
 */
export function AutocompleteHandler(commandName: string) {
    return function <T extends new () => AutocompleteHandler>(target: T): T {
        // Store metadata on the class
        (target as any).autocompleteCommandName = commandName;

        // Register the handler
        registerAutocompleteHandler(commandName, target);

        return target;
    };
}
