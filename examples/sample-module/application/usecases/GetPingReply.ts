import { CommandTextService } from "../../domain/services/CommandTextService.js";

export class GetPingReply {
    private readonly commandTextService: CommandTextService;

    constructor(commandTextService: CommandTextService) {
        this.commandTextService = commandTextService;
    }

    execute(): string {
        return this.commandTextService.getPingReply();
    }
}
