import type { AutocompleteHandler } from "app/domain/interface/handlers/listeners/AutocompleteHandler.js";
import type { AutocompleteListenerMetadata } from "app/domain/types/metadata/AutocompleteListenerMetadata.js";
import { registryProvider } from "app/domain/registry/RegistryProvider.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";
import { Keys } from "app/domain/keys/Keys.js";

/**
 * Decorator for autocomplete listeners
 * Automatically registers the decorated class for providing command parameter suggestions
 *
 * @param commandName The name of the command to provide autocomplete for
 *
 * @example
 * ```typescript
 * @Autocomplete('music')
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
export function Autocomplete(commandName: string) {
    return function <T extends new () => AutocompleteHandler>(target: T): T {
        // Register in the global registry
        const metadata: AutocompleteListenerMetadata = {
            name: target.name,
            commandName: commandName
        };

        const registry = registryProvider.getRegistry();
        registry.upsert({
            key: Keys.autocomplete(Keys.slash(commandName)),
            kind: REGISTRY_KINDS.AUTOCOMPLETE,
            metadata: metadata,
            handlerClass: target
        });

        return target;
    };
}
