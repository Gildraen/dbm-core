export class CommandTextService {
    getPingReply(): string {
        return "Pong! 🏓";
    }

    getHelpReply(): string {
        return "Available commands: `/ping`, `/help`";
    }
}
