import type { Interaction } from "@gildraen/dbm-core";
import { SlashCommand } from "@gildraen/dbm-core";
import { GetPingReply } from "../../../application/usecases/GetPingReply.js";
import { CommandTextService } from "../../../domain/services/CommandTextService.js";

@SlashCommand("ping", "Replies with pong!")
export class PingCommand {
    private readonly getPingReply = new GetPingReply(new CommandTextService());

    name = "ping";
    description = "Replies with pong!";

    buildCommand(): Record<string, unknown> {
        return {
            name: this.name,
            description: this.description,
            type: 1,
        };
    }

    async handle(interaction: Interaction): Promise<void> {
        await interaction.reply?.(this.getPingReply.execute());
    }
}
