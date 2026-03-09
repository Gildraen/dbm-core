/**
 * Platform-neutral key generation for registry
 * Provides consistent, readable keys for all command/listener types
 */

/**
 * Generate key for slash commands
 * @param cmd - Command name
 * @param group - Optional command group
 * @param sub - Optional subcommand
 * @returns Platform-neutral registry key
 *
 * @example
 * slash('ping') → 'slash:ping'
 * slash('admin', 'user', 'ban') → 'slash:admin.user.ban'
 */
export function slash(cmd: string, group?: string, sub?: string): string {
    const parts = [cmd, group, sub].filter(Boolean);
    return `slash:${parts.join('.')}`;
}

/**
 * Generate key for user context menu commands
 * @param name - Context menu name
 * @returns Platform-neutral registry key
 *
 * @example
 * contextUser('Check Profile') → 'context:user:Check Profile'
 */
export function contextUser(name: string): string {
    return `context:user:${name}`;
}

/**
 * Generate key for message context menu commands
 * @param name - Context menu name
 * @returns Platform-neutral registry key
 *
 * @example
 * contextMessage('Analyze Text') → 'context:message:Analyze Text'
 */
export function contextMessage(name: string): string {
    return `context:message:${name}`;
}

export interface ComponentKeyOptions {
    /** Optional namespace for organization */
    namespace?: string;
    /** Component identifier */
    id: string;
    /** Optional action within component */
    action?: string;
}

/**
 * Generate key for component interactions (buttons, selects, modals)
 * @param options - Component key configuration
 * @returns Platform-neutral registry key
 *
 * @example
 * component({id: 'confirm'}) → 'cmp:confirm'
 * component({namespace: 'polls', id: 'vote', action: 'submit'}) → 'cmp:polls.vote.submit'
 */
export function component(options: ComponentKeyOptions): string {
    const { namespace, id, action } = options;
    const parts = [namespace, id, action].filter(Boolean);
    return `cmp:${parts.join('.')}`;
}

/**
 * Generate key for autocomplete listeners
 * @param forKey - The command key this autocomplete serves
 * @param optionPath - Optional dot-separated path to the specific option
 * @returns Platform-neutral registry key
 *
 * @example
 * autocomplete('slash:search') → 'ac:slash:search'
 * autocomplete('slash:admin.user.ban', 'reason') → 'ac:slash:admin.user.ban.reason'
 */
export function autocomplete(forKey: string, optionPath?: string): string {
    const suffix = optionPath ? `.${optionPath}` : '';
    return `ac:${forKey}${suffix}`;
}

/**
 * Generate key for event listeners
 * @param name - Event name
 * @returns Platform-neutral registry key
 *
 * @example
 * event('guildMemberAdd') → 'evt:guildMemberAdd'
 * event('messageCreate') → 'evt:messageCreate'
 */
export function event(name: string): string {
    return `evt:${name}`;
}

/**
 * Utility to parse registry keys back to components
 * @param key - Registry key to parse
 * @returns Parsed key components
 *
 * @example
 * parseKey('slash:admin.user.ban') → { type: 'slash', parts: ['admin', 'user', 'ban'] }
 * parseKey('cmp:polls.vote.submit') → { type: 'cmp', parts: ['polls', 'vote', 'submit'] }
 */
export function parseKey(key: string): { type: string; parts: string[] } | null {
    const colonIndex = key.indexOf(':');
    if (colonIndex === -1) return null;

    const type = key.substring(0, colonIndex);
    const remainder = key.substring(colonIndex + 1);
    const parts = remainder.split('.');

    return { type, parts };
}

/**
 * Namespace for all platform key utilities
 */
export const Keys = {
    slash,
    contextUser,
    contextMessage,
    component,
    autocomplete,
    event,
    parseKey
} as const;
