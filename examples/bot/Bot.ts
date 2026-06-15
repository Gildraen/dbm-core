import { Client, GatewayIntentBits } from "discord.js";
import { registerApplication } from "@gildraen/dbm-core";

export class Bot {
    private readonly client: Client;
    private readonly token: string;

    constructor(token: string) {
        this.token = token;
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
            ],
        });
    }

    async start(): Promise<void> {
        await registerApplication(this.client);

        this.client.once("ready", () => {
            console.log(`🚀 Bot started as ${this.client.user?.tag ?? "unknown"}.`);
        });

        await this.client.login(this.token);
    }
}
