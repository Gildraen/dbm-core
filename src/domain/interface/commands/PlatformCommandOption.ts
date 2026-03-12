import type { PlatformCommandOptionType } from "app/domain/types/commands/PlatformCommandOptionType.js";
import type { PlatformCommandOptionChoice } from "./PlatformCommandOptionChoice.js";

/**
 * Command option definition
 */
export interface PlatformCommandOption {
    type: PlatformCommandOptionType;
    name: string;
    description: string;
    required?: boolean;
    choices?: PlatformCommandOptionChoice[];
    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
    autocomplete?: boolean;
    channelTypes?: string[];
}
