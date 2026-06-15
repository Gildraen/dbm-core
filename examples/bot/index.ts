import { Bot } from "./Bot.js";

const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error("❌ DISCORD_TOKEN environment variable is required.");
    process.exit(1);
}

const bot = new Bot(token);
await bot.start();

