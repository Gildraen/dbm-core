import type { CommandBuilder } from "app/domain/interface/platform/CommandBuilder.js";
import type { CommandInteraction } from "app/domain/interface/platform/interactions/CommandInteraction.js";

export interface SlashCommand {
    name: string;
    description: string;
    buildCommand(): CommandBuilder;
    execute(interaction: CommandInteraction): Promise<unknown>;
}
