import type { AutocompleteListener } from "app/domain/types/DecoratorInterfaces.js";

// Autocomplete Listener Registry
const autocompleteListeners = new Map<string, new () => AutocompleteListener>();

// Registry functions
export function registerAutocompleteListener(commandName: string, listenerClass: new () => AutocompleteListener): void {
    if (autocompleteListeners.has(commandName)) {
        console.warn(`⚠️  Autocomplete listener for '${commandName}' is already registered. Overwriting...`);
    }
    autocompleteListeners.set(commandName, listenerClass);
    console.log(`✅ Registered autocomplete listener for command: ${commandName}`);
}

export function getAllAutocompleteListeners(): Map<string, new () => AutocompleteListener> {
    return new Map(autocompleteListeners);
}

export function getAutocompleteListener(commandName: string): (new () => AutocompleteListener) | undefined {
    return autocompleteListeners.get(commandName);
}

export function clearAutocompleteListeners(): void {
    autocompleteListeners.clear();
    console.log("🧹 Cleared all autocomplete listener registrations");
}

/**
 * Decorator for Discord autocomplete listeners
 * Automatically registers the decorated class for providing command parameter suggestions
 *
 * @param commandName The name of the command to provide autocomplete for
 *
 * @example
 * ```typescript
 * @AutocompleteListener('music')
 * export class MusicAutocomplete implements AutocompleteListener {
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
export function AutocompleteListener(commandName: string) {
    return function <T extends new () => AutocompleteListener>(target: T): T {
        // Store metadata on the class
        (target as any).autocompleteCommandName = commandName;

        // Register the listener
        registerAutocompleteListener(commandName, target);

        return target;
    };
}
