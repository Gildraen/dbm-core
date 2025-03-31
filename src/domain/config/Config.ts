import fs from "fs";
import path from "path";
import { configSchema, type ConfigType } from "./ConfigSchema.js";

const CONFIG_PATH = path.resolve(process.cwd(), "dbmconfig.json");

class ConfigManager {
    private static instance: ConfigManager;
    private config: ConfigType;

    private constructor() {
        this.config = this.loadConfig();
    }

    public static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    private loadConfig(): ConfigType {
        let fileConfig = { modules: [] };

        // Try to read config file
        if (fs.existsSync(CONFIG_PATH)) {
            try {
                const rawData = fs.readFileSync(CONFIG_PATH, "utf-8");
                fileConfig = JSON.parse(rawData);
            } catch (error) {
                console.error("❌ Error reading config file:", error);
                throw new Error("Invalid configuration file");
            }
        } else {
            console.warn("⚠️ Config file not found. Using default values.");
        }

        // Merge with environment variables
        const envConfig = this.loadEnvConfig();

        // Merge file config with env config
        const mergedConfig = { ...fileConfig, ...envConfig };

        return configSchema.parse(mergedConfig); // Validate config
    }

    private loadEnvConfig(): Partial<ConfigType> {
        // Example: Read module-specific secrets from environment variables
        const envModules = process.env.MODULES ? JSON.parse(process.env.MODULES) : [];

        return {
            modules: envModules.map((mod: any) => ({
                ...mod,
                secret: process.env[`SECRET_${mod.name.toUpperCase()}`] || mod.secret,
            })),
        };
    }

    public getConfig(): ConfigType {
        return this.config;
    }
}

export const config = ConfigManager.getInstance().getConfig();