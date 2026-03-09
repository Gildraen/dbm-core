/**
 * CommandOption interface - defines a command option structure
 */
export interface CommandOption {
    name: string;
    description: string;
    type: 'string' | 'integer' | 'boolean' | 'user' | 'channel' | 'role' | 'mentionable' | 'number';
    required?: boolean;
    choices?: Array<{ name: string; value: string | number }>;
}
