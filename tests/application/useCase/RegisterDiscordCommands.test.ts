import { describe, test, expect, vi, beforeEach, type Mock } from "vitest";
import RegisterDiscordCommands from "app/application/useCase/RegisterDiscordCommands.js";
import { config } from "app/domain/config/Config.js";
import { loadModule } from "app/domain/service/ModuleLoader.js";
import { OperationStatus } from "app/domain/types/OperationStatus.js";

vi.mock("app/domain/module/ModuleLoader.js", () => ({
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
    beforeEach(() => {
        vi.resetAllMocks();
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

        const registration = new RegisterDiscordCommands(false);
        const report = await registration.execute();

        expect(mockRegister).toHaveBeenCalledWith({
            dryRun: false
        });
        expect(report.results).toEqual([
            { moduleName: "test-module", status: OperationStatus.SUCCESS, durationMs: expect.any(Number) },
        ]);
        expect(report.successCount).toBe(1);
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

        const registration = new RegisterDiscordCommands();
        const report = await registration.execute();

        expect(report.results[0].status).toBe(OperationStatus.FAILED);
        expect(report.results[0].error).toMatch(/Register not implemented/);
        expect(report.successCount).toBe(0);
        expect(report.failureCount).toBe(1);
    });

    test("handles error during module load", async () => {
        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "broken-module", config: {} },
        ]);

        (loadModule as Mock).mockRejectedValue(new Error("boom"));

        const registration = new RegisterDiscordCommands();
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

        const registration = new RegisterDiscordCommands();
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

        const registration = new RegisterDiscordCommands(true);
        await registration.execute();

        expect(mockRegister).toHaveBeenCalledWith({
            dryRun: true
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

        const registration = new RegisterDiscordCommands();
        const report = await registration.execute();

        expect(report.successCount).toBe(1);
        expect(report.failureCount).toBe(1);
        expect(report.results).toHaveLength(2);
    });

    test("handles empty module list gracefully", async () => {
        (config.getEnabledModules as Mock).mockReturnValue([]);

        const registration = new RegisterDiscordCommands();
        const report = await registration.execute();

        expect(report.results).toEqual([]);
        expect(report.successCount).toBe(0);
        expect(report.failureCount).toBe(0);
    });
});
