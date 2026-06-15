import type { CommandRepository } from "app/domain/interface/repository/CommandRepository.js";

export class InMemoryCommandRepository implements CommandRepository {
    private commands: Record<string, unknown>[] = [];

    async registerCommands(commands: Record<string, unknown>[]): Promise<number> {
        this.commands = [...commands];
        return commands.length;
    }

    async clearAllCommands(): Promise<number> {
        const count = this.commands.length;
        this.commands = [];
        return count;
    }

    async getRegisteredCommands(): Promise<Record<string, unknown>[]> {
        return [...this.commands];
    }
}
