/**
 * User interface - represents a user on the platform
 */
export interface User {
    readonly id: string;
    readonly username: string;
    readonly displayName?: string;
    readonly discriminator?: string;
    readonly tag?: string;
    readonly avatarUrl?: string;
    readonly isBot?: boolean;
}
