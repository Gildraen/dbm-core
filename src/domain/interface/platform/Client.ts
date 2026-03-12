/**
 * Client interface - represents the bot client
 */
export interface Client {
    readonly id: string;
    readonly name: string;
    readonly application?: {
        commands: {
            set(commands: unknown[]): Promise<unknown>;
        };
    };
}
