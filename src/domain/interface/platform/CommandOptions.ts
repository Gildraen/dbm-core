import type { User } from "./User.js";
import type { Channel } from "./Channel.js";
import type { Role } from "./Role.js";

/**
 * CommandOptions interface - provides methods to get command option values
 */
export interface CommandOptions {
    getString(name: string): string | null;
    getInteger(name: string): number | null;
    getBoolean(name: string): boolean | null;
    getUser(name: string): User | null;
    getChannel(name: string): Channel | null;
    getRole(name: string): Role | null;
}
