import { describe, test, expect, vi, beforeEach, type Mock } from "vitest";
import { RegisterDiscordCommands } from "app/application/useCase/RegisterDiscordCommands.js";
import { config } from "app/domain/config/Config.js";
import { loadModule } from "app/domain/service/ModuleLoader.js";
import { OperationStatus } from "app/domain/types/OperationStatus.js";
import type { CommandRepository } from "app/domain/interface/CommandRepository.js";

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
    let mockCommandRepository: CommandRepository;

    beforeEach(() => {
        vi.resetAllMocks();
        // Create a mock command repository
        mockCommandRepository = {
            registerCommands: vi.fn().mockResolvedValue(1),
            clearAllCommands: vi.fn().mockResolvedValue(0),
            getRegisteredCommands: vi.fn().mockResolvedValue([]),
        };
    });

    test("calls discoverCommands() on modules that have it", async () => {
        const mockDiscoverCommands = vi.fn().mockResolvedValue(undefined);
        const mockModule = {
            name: "test-module",
            migrate: vi.fn(),
            discoverCommands: mockDiscoverCommands
        };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "test-module", config: { enabled: true, settings: {} } },
        ]);

        (loadModule as Mock).mockResolvedValue(mockModule);

        const registration = new RegisterDiscordCommands(mockCommandRepository, false);
        const report = await registration.execute();

        expect(mockDiscoverCommands).toHaveBeenCalledWith();
        expect(report.results).toEqual([
            { moduleName: "test-module", status: OperationStatus.SUCCESS, durationMs: expect.any(Number) },
            { moduleName: "discord-api-registration", status: OperationStatus.SUCCESS, durationMs: expect.any(Number) }
        ]);
        expect(report.successCount).toBe(2);
        expect(report.failureCount).toBe(0);
    });

    test("handles modules with failing discoverCommands method", async () => {
        const mockModule = {
            name: "failing-register-module",
            migrate: vi.fn(),
            discoverCommands: vi.fn().mockRejectedValue(new Error("Discovery failed"))
        };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "failing-register-module", config: {} },
        ]);

        (loadModule as Mock).mockResolvedValue(mockModule);

        const registration = new RegisterDiscordCommands(mockCommandRepository);
        const report = await registration.execute();

        expect(report.results[0].status).toBe(OperationStatus.FAILED);
        expect(report.results[0].error).toMatch(/Discovery failed/);
        expect(report.successCount).toBe(1); // Discord registration still succeeds
        expect(report.failureCount).toBe(1);
    });

    test("handles error during module load", async () => {
        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "broken-module", config: {} },
        ]);

        (loadModule as Mock).mockRejectedValue(new Error("boom"));

        const registration = new RegisterDiscordCommands(mockCommandRepository);
        const report = await registration.execute();

        expect(report.results[0].status).toBe(OperationStatus.FAILED);
        expect(report.results[0].error).toMatch(/boom/);
        expect(report.failureCount).toBe(1);
    });

    test("handles error during module discovery", async () => {
        const mockModule = {
            name: "error-module",
            migrate: vi.fn(),
            discoverCommands: vi.fn().mockRejectedValue(new Error("💥 discovery error"))
        };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "error-module", config: {} },
        ]);

        (loadModule as Mock).mockResolvedValue(mockModule);

        const registration = new RegisterDiscordCommands(mockCommandRepository);
        const report = await registration.execute();

        expect(report.results[0]).toEqual({
            moduleName: "error-module",
            status: OperationStatus.FAILED,
            error: "💥 discovery error",
        });
    });

    test("passes dryRun to module discoverCommands method", async () => {
        const mockDiscoverCommands = vi.fn().mockResolvedValue(undefined);
        const mockModule = {
            name: "test-module",
            migrate: vi.fn(),
            discoverCommands: mockDiscoverCommands
        };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "test-module", config: {} },
        ]);

        (loadModule as Mock).mockResolvedValue(mockModule);

        const registration = new RegisterDiscordCommands(mockCommandRepository, true);
        await registration.execute();

        expect(mockDiscoverCommands).toHaveBeenCalledWith();
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
                discoverCommands: vi.fn().mockResolvedValue(undefined)
            })
            .mockResolvedValueOnce({
                name: "mod-fail",
                migrate: vi.fn(),
                discoverCommands: vi.fn().mockRejectedValue(new Error("💥 fail"))
            });

        const registration = new RegisterDiscordCommands(mockCommandRepository);
        const report = await registration.execute();

        expect(report.successCount).toBe(2); // One successful module, one successful Discord registration
        expect(report.failureCount).toBe(1);
        expect(report.results).toHaveLength(3); // mod-success, mod-fail, discord-api-registration
    });

    test("handles empty module list gracefully", async () => {
        (config.getEnabledModules as Mock).mockReturnValue([]);

        const registration = new RegisterDiscordCommands(mockCommandRepository);
        const report = await registration.execute();

        expect(report.results).toEqual([
            { moduleName: "discord-api-registration", status: OperationStatus.SUCCESS, durationMs: expect.any(Number) }
        ]);
        expect(report.successCount).toBe(1); // Only Discord registration happens
        expect(report.failureCount).toBe(0);
    });
});
