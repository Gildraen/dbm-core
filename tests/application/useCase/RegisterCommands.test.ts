import { describe, test, expect, vi, beforeEach, type Mock } from "vitest";
import { RegisterCommands } from "app/application/useCase/RegisterCommands.js";
import { config } from "app/domain/config/Config.js";
import { loadModule } from "app/domain/service/ModuleLoader.js";
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

// Mock the CommandRegistrationService
vi.mock("app/domain/service/CommandRegistrationService.js", () => ({
    CommandRegistrationService: vi.fn().mockImplementation(() => ({
        registerDiscoveredCommands: vi.fn().mockResolvedValue(2),
    })),
}));

describe("RegisterCommands", () => {
    let mockCommandRepository: CommandRepository;
    let consoleSpy: { log: Mock; error: Mock };

    beforeEach(() => {
        vi.resetAllMocks();

        // Create mock console
        consoleSpy = {
            log: vi.fn(),
            error: vi.fn(),
        };
        vi.stubGlobal('console', consoleSpy);

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

        const registration = new RegisterCommands(mockCommandRepository);
        await registration.execute();

        expect(mockDiscoverCommands).toHaveBeenCalledWith();
    });

    test("logs error when module discovery fails", async () => {
        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "broken-module", config: { enabled: true, settings: {} } },
        ]);

        (loadModule as Mock).mockRejectedValue(new Error("Module not found"));

        const registration = new RegisterCommands(mockCommandRepository);
        await registration.execute();

        expect(consoleSpy.error).toHaveBeenCalledWith(
            expect.stringContaining('Failed to discover commands for module "broken-module": Module not found')
        );
    });

    test("logs error when command registration fails", async () => {
        const { CommandRegistrationService } = await import("app/domain/service/CommandRegistrationService.js");

        // Create a mock instance that will fail
        const mockService = new CommandRegistrationService(mockCommandRepository);
        mockService.registerDiscoveredCommands = vi.fn().mockRejectedValue(new Error("Discord API error"));

        // Mock the constructor to return our failing mock
        vi.mocked(CommandRegistrationService).mockImplementation(() => mockService);

        (config.getEnabledModules as Mock).mockReturnValue([]);

        const registration = new RegisterCommands(mockCommandRepository);
        await registration.execute();

        expect(consoleSpy.error).toHaveBeenCalledWith(
            expect.stringContaining('Failed to register commands with Discord: Discord API error')
        );
    });

    test("skips modules that don't have discoverCommands method", async () => {
        const mockModule = {
            name: "simple-module",
            migrate: vi.fn(),
            // No discoverCommands method
        };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "simple-module", config: { enabled: true, settings: {} } },
        ]);

        (loadModule as Mock).mockResolvedValue(mockModule);

        const registration = new RegisterCommands(mockCommandRepository);
        await registration.execute();

        // Should not throw and should complete successfully
        expect(loadModule).toHaveBeenCalledWith("simple-module");
    });

    test("processes multiple modules", async () => {
        const mockModule1 = {
            name: "module-1",
            migrate: vi.fn(),
            discoverCommands: vi.fn().mockResolvedValue(undefined)
        };

        const mockModule2 = {
            name: "module-2",
            migrate: vi.fn(),
            discoverCommands: vi.fn().mockResolvedValue(undefined)
        };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "module-1", config: { enabled: true, settings: {} } },
            { name: "module-2", config: { enabled: true, settings: {} } },
        ]);

        (loadModule as Mock)
            .mockResolvedValueOnce(mockModule1)
            .mockResolvedValueOnce(mockModule2);

        const registration = new RegisterCommands(mockCommandRepository);
        await registration.execute();

        expect(mockModule1.discoverCommands).toHaveBeenCalledWith();
        expect(mockModule2.discoverCommands).toHaveBeenCalledWith();
    });

    test("continues processing other modules when one module fails", async () => {
        const mockModule = {
            name: "good-module",
            migrate: vi.fn(),
            discoverCommands: vi.fn().mockResolvedValue(undefined)
        };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "broken-module", config: { enabled: true, settings: {} } },
            { name: "good-module", config: { enabled: true, settings: {} } },
        ]);

        (loadModule as Mock)
            .mockRejectedValueOnce(new Error("boom"))
            .mockResolvedValueOnce(mockModule);

        const registration = new RegisterCommands(mockCommandRepository);
        await registration.execute();

        // Should still process the good module
        expect(mockModule.discoverCommands).toHaveBeenCalledWith();

        // Should log error for broken module
        expect(consoleSpy.error).toHaveBeenCalledWith(
            expect.stringContaining('Failed to discover commands for module "broken-module": boom')
        );
    });
});
