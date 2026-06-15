import type { ModuleInterface } from "app/domain/interface/ModuleInterface.js";
import type { Interaction } from "app/domain/interface/InteractionHandler.js";
import { SlashCommand } from "app/domain/decorators/SlashCommand.js";
import { Event } from "app/domain/decorators/Event.js";

export class PingCommand {
    name = "ping";
    description = "Replies with pong!";

    buildCommand(): Record<string, unknown> {
        return { name: this.name, description: this.description, type: 1 };
    }

    async handle(interaction: Interaction): Promise<unknown> {
        return interaction.reply?.("Pong!");
    }
}

export class ReadyListener {
    name = "ready-listener";

    async handle(...args: unknown[]): Promise<unknown> {
        const payload = args[0];
        if (
            typeof payload === "object" &&
            payload !== null &&
            "mark" in payload &&
            typeof (payload as { mark: unknown }).mark === "function"
        ) {
            (payload as { mark: () => void }).mark();
        }
        return undefined;
    }
}

const SampleModule: ModuleInterface = {
    name: "sample-full-module",

    async discoverCommands() {
        SlashCommand("ping", "Replies with pong!")(PingCommand);
    },

    async discoverListeners() {
        Event("ready", true)(ReadyListener);
    },
};

export default SampleModule;
