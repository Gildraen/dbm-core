/**
 * Key mapping utilities for Discord platform
 * Handles conversion between platform-neutral keys and Discord-specific identifiers
 */

import type { RegistryKey } from "app/domain/interface/registry/types.js";
import { Keys } from "app/domain/keys/Keys.js";

/**
 * Convert platform registry key to Discord customId (for components)
 * @param key - Platform registry key
 * @returns Discord-compatible customId
 *
 * @example
 * keyToCustomId('cmp:polls.vote.submit') → 'polls.vote.submit'
 * keyToCustomId('cmp:confirm') → 'confirm'
 */
export function keyToCustomId(key: RegistryKey): string {
    const parsed = Keys.parseKey(key);
    if (!parsed || parsed.type !== 'cmp') {
        throw new Error(`Invalid component key for customId conversion: ${key}`);
    }
    return parsed.parts.join('.');
}

/**
 * Convert Discord customId back to platform registry key
 * @param customId - Discord customId
 * @param namespace - Optional namespace for scoping
 * @returns Platform registry key
 *
 * @example
 * customIdToKey('confirm') → 'cmp:confirm'
 * customIdToKey('vote.submit', 'polls') → 'cmp:polls.vote.submit'
 */
export function customIdToKey(customId: string, namespace?: string): RegistryKey {
    return Keys.component({
        id: customId,
        namespace
    });
}

/**
 * Convert platform registry key to Discord slash command path
 * @param key - Platform registry key
 * @returns Discord slash command parts
 *
 * @example
 * keyToSlashCommand('slash:ping') → { name: 'ping' }
 * keyToSlashCommand('slash:admin.user.ban') → { name: 'admin', group: 'user', subcommand: 'ban' }
 */
export function keyToSlashCommand(key: RegistryKey): {
    name: string;
    group?: string;
    subcommand?: string;
} {
    const parsed = Keys.parseKey(key);
    if (!parsed || parsed.type !== 'slash') {
        throw new Error(`Invalid slash command key: ${key}`);
    }

    const [name, group, subcommand] = parsed.parts;
    return {
        name,
        group,
        subcommand
    };
}

/**
 * Convert Discord slash command to platform registry key
 * @param name - Command name
 * @param group - Optional group
 * @param subcommand - Optional subcommand
 * @returns Platform registry key
 */
export function slashCommandToKey(name: string, group?: string, subcommand?: string): RegistryKey {
    return Keys.slash(name, group, subcommand);
}

/**
 * Extract event name from platform registry key
 * @param key - Platform registry key
 * @returns Event name
 */
export function keyToEventName(key: RegistryKey): string {
    const parsed = Keys.parseKey(key);
    if (!parsed || parsed.type !== 'evt') {
        throw new Error(`Invalid event key: ${key}`);
    }
    return parsed.parts.join('.');
}

/**
 * Convert Discord event name to platform registry key
 * @param eventName - Discord event name
 * @returns Platform registry key
 */
export function eventNameToKey(eventName: string): RegistryKey {
    return Keys.event(eventName);
}

/**
 * Validate if a key is suitable for Discord platform
 * @param key - Platform registry key
 * @returns Validation result with any issues
 */
export function validateDiscordKey(key: RegistryKey): {
    valid: boolean;
    issues: string[];
} {
    const issues: string[] = [];
    const parsed = Keys.parseKey(key);

    if (!parsed) {
        issues.push('Invalid key format');
        return { valid: false, issues };
    }

    switch (parsed.type) {
        case 'slash':
            if (parsed.parts.length === 0 || parsed.parts.length > 3) {
                issues.push('Slash commands must have 1-3 parts (name, group?, subcommand?)');
            }
            if (parsed.parts.some(part => !/^[\w-]{1,32}$/.test(part))) {
                issues.push('Slash command parts must be 1-32 alphanumeric characters');
            }
            break;

        case 'cmp':
            if (parsed.parts.length === 0) {
                issues.push('Component key must have at least an id');
            }
            // Discord customId limit is 100 characters
            if (parsed.parts.join('.').length > 100) {
                issues.push('Component customId too long (max 100 chars)');
            }
            break;

        case 'context:user':
        case 'context:message':
            if (parsed.parts.length !== 1) {
                issues.push('Context menu keys must have exactly one part (name)');
            }
            break;
    }

    return {
        valid: issues.length === 0,
        issues
    };
}
