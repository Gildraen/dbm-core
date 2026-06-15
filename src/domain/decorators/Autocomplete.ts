import type { AutocompleteHandler } from "app/domain/interface/handlers/listeners/AutocompleteHandler.js";
import { registry } from "app/domain/registry/RegistryProvider.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";
import { Keys } from "app/domain/keys/Keys.js";

/**
 * Decorator for autocomplete listeners
 * Automatically registers the decorated class for providing command parameter suggestions
 *
 * @param commandName The name of the command to provide autocomplete for
 * @param optionName Optional specific option name to handle; omit to handle all options for the command
 *
 * @example
 * ```typescript
 * // Handles all autocomplete options for the 'music' command
 * @Autocomplete('music')
 * export class MusicAutocomplete implements AutocompleteHandler {
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
 *
 * // Handles only the 'genre' option for the 'music' command
 * @Autocomplete('music', 'genre')
 * export class MusicGenreAutocomplete implements AutocompleteHandler {
 *     async handle(interaction: AutocompleteInteraction): Promise<void> {
 *         await interaction.respond([{ name: 'Rock', value: 'rock' }]);
 *     }
 * }
 * ```
 */
export function Autocomplete(commandName: string, optionName?: string) {
    return function <T extends new () => AutocompleteHandler>(target: T): T {
        registry.upsert({
            key: Keys.autocomplete(Keys.slash(commandName), optionName),
            kind: REGISTRY_KINDS.AUTOCOMPLETE,
            metadata: { name: target.name, commandName, optionName },
            handlerClass: target
        });

        return target;
    };
}
