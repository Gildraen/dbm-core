/**
 * Registry type definitions and constants
 */

export type RegistryKey = string;

/**
 * Registry kind constants - use these instead of string literals
 */
export const REGISTRY_KINDS = {
    // Commands
    SLASH: 'slash',
    CONTEXT_USER: 'context:user',
    CONTEXT_MESSAGE: 'context:message',

    // Listeners
    AUTOCOMPLETE: 'autocomplete',
    EVENT: 'event',

    // Components - Select Menus
    STRING_SELECT: 'component:string-select',
    USER_SELECT: 'component:user-select',
    ROLE_SELECT: 'component:role-select',
    CHANNEL_SELECT: 'component:channel-select',
    MENTIONABLE_SELECT: 'component:mentionable-select',

    // Components - Other (for future use)
    BUTTON: 'component:button',
    MODAL: 'component:modal',
} as const;

export type Kind = typeof REGISTRY_KINDS[keyof typeof REGISTRY_KINDS];

export type CommandKind =
    | typeof REGISTRY_KINDS.SLASH
    | typeof REGISTRY_KINDS.CONTEXT_USER
    | typeof REGISTRY_KINDS.CONTEXT_MESSAGE;
