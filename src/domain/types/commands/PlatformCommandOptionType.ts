import { OPTION_TYPES } from "./OptionTypes.js";

/**
 * Command option type - derived from option type constants
 */
export type PlatformCommandOptionType = typeof OPTION_TYPES[keyof typeof OPTION_TYPES];
