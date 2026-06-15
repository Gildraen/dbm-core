import type { Interaction } from "@gildraen/dbm-core";
import { SlashCommand } from "@gildraen/dbm-core";
import { GetHelpReply } from "../../../application/usecases/GetHelpReply.js";
import { CommandTextService } from "../../../domain/services/CommandTextService.js";

@SlashCommand("help", "Shows available commands.")
export class HelpCommand {
    private readonly getHelpReply = new GetHelpReply(new CommandTextService());

    name = "help";
    description = "Shows available commands.";

    buildCommand(): Record<string, unknown> {
        return {
            name: this.name,
            description: this.description,
            type: 1,
        };
    }

    async handle(interaction: Interaction): Promise<void> {
        await interaction.reply?.(this.getHelpReply.execute());
    }
}
