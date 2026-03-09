/**
 * Guild interface - represents a server/guild on the platform
 */
export interface Guild {
    readonly id: string;
    readonly name: string;
    readonly iconUrl?: string;
}
