import { describe, test, expect, vi, beforeEach, type Mock } from "vitest";
import RegisterDiscordCommands from "app/application/useCase/RegisterDiscordCommands.js";
import { config } from "app/domain/config/Config.js";
import { loadModule } from "app/domain/service/ModuleLoader.js";
import { OperationStatus } from "app/domain/types/OperationStatus.js";
import type { Client } from "discord.js";

vi.mock("app/domain/service/ModuleLoader.js", () => ({
    loadModule: vi.fn(),
}));

vi.mock("app/domain/config/Config.js", () => {
    return {
        config: {
            getEnabledModules: vi.fn(),
        },
    };
});

describe("RegisterDiscordCommands", () => {
    let mockClient: Client;

    beforeEach(() => {
        vi.resetAllMocks();
        // Create a mock Discord client
        mockClient = {
            isReady: vi.fn().mockReturnValue(true),
            destroy: vi.fn(),
        } as unknown as Client;
    });

    test("calls register() on modules that have it", async () => {
        const mockRegister = vi.fn().mockResolvedValue(undefined);
        const mockModule = {
            name: "test-module",
            migrate: vi.fn(),
            register: mockRegister
        };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "test-module", config: { enabled: true, settings: {} } },
        ]);

        (loadModule as Mock).mockResolvedValue(mockModule);

        const registration = new RegisterDiscordCommands(mockClient, false);
        const report = await registration.execute();

        expect(mockRegister).toHaveBeenCalledWith({
            commandTool: expect.any(Object)
        });
        expect(report.results).toEqual([
            { moduleName: "test-module", status: OperationStatus.SUCCESS, durationMs: expect.any(Number) },
            { moduleName: "discord-api-registration", status: OperationStatus.SUCCESS, durationMs: expect.any(Number) }
        ]);
        expect(report.successCount).toBe(2);
        expect(report.failureCount).toBe(0);
    });

    test("handles modules with failing register method", async () => {
        const mockModule = {
            name: "failing-register-module",
            migrate: vi.fn(),
            register: vi.fn().mockRejectedValue(new Error("Register not implemented"))
        };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "failing-register-module", config: {} },
        ]);

        (loadModule as Mock).mockResolvedValue(mockModule);

        const registration = new RegisterDiscordCommands(mockClient);
        const report = await registration.execute();

        expect(report.results[0].status).toBe(OperationStatus.FAILED);
        expect(report.results[0].error).toMatch(/Register not implemented/);
        expect(report.successCount).toBe(1); // Discord registration still succeeds
        expect(report.failureCount).toBe(1);
    });

    test("handles error during module load", async () => {
        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "broken-module", config: {} },
        ]);

        (loadModule as Mock).mockRejectedValue(new Error("boom"));

        const registration = new RegisterDiscordCommands(mockClient);
        const report = await registration.execute();

        expect(report.results[0].status).toBe(OperationStatus.FAILED);
        expect(report.results[0].error).toMatch(/boom/);
        expect(report.failureCount).toBe(1);
    });

    test("handles error during module registration", async () => {
        const mockModule = {
            name: "error-module",
            migrate: vi.fn(),
            register: vi.fn().mockRejectedValue(new Error("💥 registration error"))
        };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "error-module", config: {} },
        ]);

        (loadModule as Mock).mockResolvedValue(mockModule);

        const registration = new RegisterDiscordCommands(mockClient);
        const report = await registration.execute();

        expect(report.results[0]).toEqual({
            moduleName: "error-module",
            status: OperationStatus.FAILED,
            error: "💥 registration error",
        });
    });

    test("passes dryRun to module register method", async () => {
        const mockRegister = vi.fn().mockResolvedValue(undefined);
        const mockModule = {
            name: "test-module",
            migrate: vi.fn(),
            register: mockRegister
        };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "test-module", config: {} },
        ]);

        (loadModule as Mock).mockResolvedValue(mockModule);

        const registration = new RegisterDiscordCommands(mockClient, true);
        await registration.execute();

        expect(mockRegister).toHaveBeenCalledWith({
            commandTool: expect.any(Object)
        });
    });

    test("generates report with mixed results", async () => {
        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "mod-success", config: {} },
            { name: "mod-fail", config: {} },
        ]);

        (loadModule as Mock)
            .mockResolvedValueOnce({
                name: "mod-success",
                migrate: vi.fn(),
                register: vi.fn().mockResolvedValue(undefined)
            })
            .mockResolvedValueOnce({
                name: "mod-fail",
                migrate: vi.fn(),
                register: vi.fn().mockRejectedValue(new Error("💥 fail"))
            });

        const registration = new RegisterDiscordCommands(mockClient);
        const report = await registration.execute();

        expect(report.successCount).toBe(2); // One successful module, one successful Discord registration
        expect(report.failureCount).toBe(1);
        expect(report.results).toHaveLength(3); // mod-success, mod-fail, discord-api-registration
    });

    test("handles empty module list gracefully", async () => {
        (config.getEnabledModules as Mock).mockReturnValue([]);

        const registration = new RegisterDiscordCommands(mockClient);
        const report = await registration.execute();

        expect(report.results).toEqual([
            { moduleName: "discord-api-registration", status: OperationStatus.SUCCESS, durationMs: expect.any(Number) }
        ]);
        expect(report.successCount).toBe(1); // Only Discord registration happens
        expect(report.failureCount).toBe(0);
    });
});
