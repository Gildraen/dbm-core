import { beforeEach, describe, expect, test, vi } from "vitest";
import type { CommandRepository } from "app/domain/interface/repository/CommandRepository.js";
import type { PlatformRegistryReaderInterface } from "app/domain/interface/registry/PlatformRegistryReaderInterface.js";

const mocks = vi.hoisted(() => {
    const getEnabledModules = vi.fn();
    const loadModule = vi.fn();
    const registerDiscoveredCommands = vi.fn();
    const CommandRegistrationService = vi.fn().mockImplementation(() => ({
        registerDiscoveredCommands,
    }));

    return {
        getEnabledModules,
        loadModule,
        registerDiscoveredCommands,
        CommandRegistrationService,
    };
});

vi.mock("app/domain/config/Config.js", () => ({
    config: {
        getEnabledModules: mocks.getEnabledModules,
    },
}));

vi.mock("app/domain/service/ModuleLoader.js", () => ({
    loadModule: mocks.loadModule,
}));

vi.mock("app/domain/service/CommandRegistrationService.js", () => ({
    CommandRegistrationService: mocks.CommandRegistrationService,
}));

import { RegisterCommands } from "app/application/useCase/RegisterCommands.js";

describe("RegisterCommands", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("discovers commands from enabled modules and registers them", async () => {
        const moduleA = { discoverCommands: vi.fn().mockResolvedValue(undefined) };
        const moduleB = { discoverCommands: vi.fn().mockResolvedValue(undefined) };

        mocks.getEnabledModules.mockReturnValue([
            { name: "module-a", config: { enabled: true, settings: {} } },
            { name: "module-b", config: { enabled: true, settings: {} } },
        ]);
        mocks.loadModule
            .mockResolvedValueOnce(moduleA)
            .mockResolvedValueOnce(moduleB);
        mocks.registerDiscoveredCommands.mockResolvedValue(undefined);

        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

        const commandRepository = {} as CommandRepository;
        const registry = {} as PlatformRegistryReaderInterface;
        const useCase = new RegisterCommands(commandRepository, registry);

        await useCase.execute();

        expect(mocks.CommandRegistrationService).toHaveBeenCalledWith(commandRepository, registry);
        expect(mocks.loadModule).toHaveBeenNthCalledWith(1, "module-a");
        expect(mocks.loadModule).toHaveBeenNthCalledWith(2, "module-b");
        expect(moduleA.discoverCommands).toHaveBeenCalledTimes(1);
        expect(moduleB.discoverCommands).toHaveBeenCalledTimes(1);
        expect(mocks.registerDiscoveredCommands).toHaveBeenCalledTimes(1);
        expect(errorSpy).not.toHaveBeenCalled();
    });

    test("continues registration when one module fails command discovery", async () => {
        const moduleB = { discoverCommands: vi.fn().mockResolvedValue(undefined) };

        mocks.getEnabledModules.mockReturnValue([
            { name: "broken-module", config: { enabled: true, settings: {} } },
            { name: "healthy-module", config: { enabled: true, settings: {} } },
        ]);
        mocks.loadModule
            .mockRejectedValueOnce(new Error("Cannot import module"))
            .mockResolvedValueOnce(moduleB);
        mocks.registerDiscoveredCommands.mockResolvedValue(undefined);

        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

        const useCase = new RegisterCommands({} as CommandRepository, {} as PlatformRegistryReaderInterface);
        await useCase.execute();

        expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining("Failed to discover commands for module \"broken-module\": Cannot import module")
        );
        expect(moduleB.discoverCommands).toHaveBeenCalledTimes(1);
        expect(mocks.registerDiscoveredCommands).toHaveBeenCalledTimes(1);
    });

    test("logs registration failure when command registration throws", async () => {
        mocks.getEnabledModules.mockReturnValue([]);
        mocks.registerDiscoveredCommands.mockRejectedValue(new Error("Discord API unavailable"));

        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

        const useCase = new RegisterCommands({} as CommandRepository, {} as PlatformRegistryReaderInterface);
        await useCase.execute();

        expect(mocks.registerDiscoveredCommands).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith(
            "❌ Failed to register commands with Discord: Discord API unavailable"
        );
    });
});
