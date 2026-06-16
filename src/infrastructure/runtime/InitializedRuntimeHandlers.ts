import { Client } from "discord.js";
import { RegisterCommands } from "app/application/useCase/RegisterCommands.js";
import type { RuntimeContext } from "app/application/interface/RuntimeContext.js";
import type { EventHandler } from "app/domain/interface/handlers/listeners/EventHandler.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";
import { Keys } from "app/domain/keys/Keys.js";
import { DiscordCommandRepository } from "app/infrastructure/discord/repository/DiscordCommandRepository.js";

/**
 * Manages explicit initialization of runtime handlers.
 * Replaces implicit side-effect initialization with deterministic, testable setup.
 */
export class RuntimeInitializer {
    /**
     * Register a handler that schedules command registration on Discord ready event.
     * This handler will execute once when the bot is ready, ensuring commands are registered
     * with Discord before the bot starts handling interactions.
     *
     * @param context The RuntimeContext for the current execution
     *
     * @example
     * ```typescript
     * const client = new Client({ intents: [GatewayIntentBits.Guilds] });
     * const context = createRuntimeContext(); // or use global context
     * runtimeInitializer.initRegisterCommandsOnReady(context);
     * await registerListeners(client);
     * ```
     */
    initRegisterCommandsOnReady(context: RuntimeContext): void {
        // Handler implementation: on Discord ready event, trigger command registration
        class RegisterCommandsOnReadyHandler implements EventHandler {
            readonly name = "RegisterCommandsOnReadyHandler";

            async handle(...args: unknown[]): Promise<void> {
                const [candidateClient] = args;
                if (!(candidateClient instanceof Client)) {
                    console.error("❌ Failed to register commands on ready: invalid Discord client argument");
                    return;
                }

                const client = candidateClient;
                try {
                    const commandRepository = new DiscordCommandRepository(client);
                    const useCase = new RegisterCommands(commandRepository, context);
                    await useCase.execute();
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.error(`❌ Failed to register commands on ready: ${errorMessage}`);
                }
            }
        }

        // Register the handler in the context's registry
        context.registry.upsert({
            key: Keys.event("ready"),
            kind: REGISTRY_KINDS.EVENT,
            metadata: { name: "RegisterCommandsOnReadyHandler", eventName: "ready", once: true },
            handlerClass: RegisterCommandsOnReadyHandler,
        });
    }
}

/**
 * Default instance for runtime initialization.
 * Used to initialize handlers during bot startup.
 */
export const runtimeInitializer = new RuntimeInitializer();
