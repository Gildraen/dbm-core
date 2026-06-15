import type { ModuleInterface } from "@gildraen/dbm-core";

import "./infrastructure/discord/commands/PingCommand.js";
import "./infrastructure/discord/commands/HelpCommand.js";

export class SampleModule implements ModuleInterface {
    readonly name = "sample-module";
}
