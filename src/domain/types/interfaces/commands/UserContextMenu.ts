import type { CommandBuilder } from "app/domain/interface/platform/CommandBuilder.js";
import type { UserContextInteraction } from "app/domain/interface/platform/interactions/UserContextInteraction.js";

export interface UserContextMenu {
    name: string;
    buildCommand(): CommandBuilder;
    execute(interaction: UserContextInteraction): Promise<unknown>;
}
