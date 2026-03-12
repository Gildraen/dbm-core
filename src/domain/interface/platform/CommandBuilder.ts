import type { CommandOption } from "./CommandOption.js";

/**
 * CommandBuilder interface - builder for creating commands
 */
export interface CommandBuilder {
    setName(name: string): this;
    setDescription(description: string): this;
    addOption?(option: CommandOption): this;
    toJSON(): unknown;
}
