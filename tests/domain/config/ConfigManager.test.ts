import { beforeEach, describe, expect, test, vi, type Mock } from "vitest";
import fs from "fs";
import { ConfigManager } from "domain/config/ConfigManager.js";
vi.mock("fs");

describe("ConfigManager", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    test("loads a valid config file", () => {
        (fs.existsSync as Mock).mockReturnValue(true);
        (fs.readFileSync as Mock).mockReturnValue(
            JSON.stringify({
                "example-module": { enabled: true, settings: {} },
            })
        );
        const configManager = new ConfigManager();
        const mod = configManager.getModuleConfig("example-module");

        expect(mod).toBeDefined();
        expect(mod?.enabled).toBe(true);
        expect(mod?.settings).toEqual({});
    });
    test("throws if config file is missing", () => {
        (fs.existsSync as Mock).mockReturnValue(false);
        expect(() => new ConfigManager()).toThrowErrorMatchingInlineSnapshot(`[Error: Missing configuration file: dbmconfig.json]`);
    });
    test("throw on unreadable config file", () => {
        (fs.existsSync as Mock).mockReturnValue(true);
        (fs.readFileSync as Mock).mockImplementation(() => {
            throw new Error("Permission denied");
        });
        expect(() => new ConfigManager()).toThrowErrorMatchingInlineSnapshot(`[Error: Unreadable configuration file]`);
    });
    test("throws on invalid JSON", () => {
        (fs.existsSync as Mock).mockReturnValue(true);
        (fs.readFileSync as Mock).mockReturnValue("{ this is not json }");
        expect(() => new ConfigManager()).toThrowErrorMatchingInlineSnapshot(`[Error: Invalid JSON in configuration file]`);
    });
    test("throws on invalid configuration structure", () => {
        (fs.existsSync as Mock).mockReturnValue(true);
        (fs.readFileSync as Mock).mockReturnValue(
            JSON.stringify({
                "example-module": { invalidKey: true },
            })
        );
        expect(() => new ConfigManager()).toThrowErrorMatchingInlineSnapshot(`[Error: Invalid configuration structure]`);
    });
    test("throw error for non-existent module config", () => {
        (fs.existsSync as Mock).mockReturnValue(true);
        (fs.readFileSync as Mock).mockReturnValue(
            JSON.stringify({
                "example-module": { enabled: true, settings: {} },
            })
        );
        const configManager = new ConfigManager();
        expect(() => configManager.getModuleConfig("non-existent-module")).toThrowErrorMatchingInlineSnapshot(`[Error: Module config for "non-existent-module" not found.]`);
    });
});
