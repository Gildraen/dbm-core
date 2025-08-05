import type { CommandRegistrationTool } from "app/domain/service/CommandRegistrationTool.js";

export interface RegisterContext {
    commandTool: CommandRegistrationTool;
}
