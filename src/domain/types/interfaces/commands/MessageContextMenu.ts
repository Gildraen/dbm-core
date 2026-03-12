import type { CommandBuilder } from "app/domain/interface/platform/CommandBuilder.js";
import type { MessageContextInteraction } from "app/domain/interface/platform/interactions/MessageContextInteraction.js";

export interface MessageContextMenu {
    name: string;
    buildCommand(): CommandBuilder;
    execute(interaction: MessageContextInteraction): Promise<unknown>;
}
