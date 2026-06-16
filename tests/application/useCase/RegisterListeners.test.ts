import { beforeEach, describe, expect, test, vi } from "vitest";
import type { ListenerRepository } from "app/domain/interface/repository/ListenerRepository.js";

const mocks = vi.hoisted(() => {
    const getEnabledModules = vi.fn();
    const loadModule = vi.fn();
    const registerDiscoveredListeners = vi.fn();
    const injectedRegistry = {};
    const ListenerRegistrationService = vi.fn().mockImplementation(() => ({
        registerDiscoveredListeners,
    }));

    return {
        getEnabledModules,
        loadModule,
        registerDiscoveredListeners,
        injectedRegistry,
        ListenerRegistrationService,
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

vi.mock("app/domain/service/ListenerRegistrationService.js", () => ({
    ListenerRegistrationService: mocks.ListenerRegistrationService,
}));

vi.mock("app/domain/registry/RegistryProvider.js", () => ({
    registry: mocks.injectedRegistry,
}));

import { RegisterListeners } from "app/application/useCase/RegisterListeners.js";

describe("RegisterListeners", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("discovers listeners from enabled modules and registers them", async () => {
        const moduleA = { discoverListeners: vi.fn().mockResolvedValue(undefined) };
        const moduleB = { discoverListeners: vi.fn().mockResolvedValue(undefined) };

        mocks.getEnabledModules.mockReturnValue([
            { name: "module-a", config: { enabled: true, settings: {} } },
            { name: "module-b", config: { enabled: true, settings: {} } },
        ]);
        mocks.loadModule
            .mockResolvedValueOnce(moduleA)
            .mockResolvedValueOnce(moduleB);
        mocks.registerDiscoveredListeners.mockReturnValue(3);

        const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

        const listenerRepository = {} as ListenerRepository;
        const useCase = new RegisterListeners(listenerRepository);

        await useCase.execute();

        expect(mocks.ListenerRegistrationService).toHaveBeenCalledWith(listenerRepository, mocks.injectedRegistry);
        expect(mocks.loadModule).toHaveBeenNthCalledWith(1, "module-a");
        expect(mocks.loadModule).toHaveBeenNthCalledWith(2, "module-b");
        expect(moduleA.discoverListeners).toHaveBeenCalledTimes(1);
        expect(moduleB.discoverListeners).toHaveBeenCalledTimes(1);
        expect(mocks.registerDiscoveredListeners).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith("✅ Successfully registered 3 listeners");
        expect(errorSpy).not.toHaveBeenCalled();
    });

    test("continues registration when one module fails discovery", async () => {
        const moduleB = { discoverListeners: vi.fn().mockResolvedValue(undefined) };

        mocks.getEnabledModules.mockReturnValue([
            { name: "broken-module", config: { enabled: true, settings: {} } },
            { name: "healthy-module", config: { enabled: true, settings: {} } },
        ]);
        mocks.loadModule
            .mockRejectedValueOnce(new Error("Cannot import module"))
            .mockResolvedValueOnce(moduleB);
        mocks.registerDiscoveredListeners.mockReturnValue(1);

        const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

        const useCase = new RegisterListeners({} as ListenerRepository);
        await useCase.execute();

        expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining("Failed to discover listeners for module \"broken-module\": Cannot import module")
        );
        expect(moduleB.discoverListeners).toHaveBeenCalledTimes(1);
        expect(mocks.registerDiscoveredListeners).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith("✅ Successfully registered 1 listeners");
    });

    test("logs registration failure when listener registration throws", async () => {
        mocks.getEnabledModules.mockReturnValue([]);
        mocks.registerDiscoveredListeners.mockImplementation(() => {
            throw new Error("Registry unavailable");
        });

        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

        const useCase = new RegisterListeners({} as ListenerRepository);
        await useCase.execute();

        expect(mocks.registerDiscoveredListeners).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith(
            "❌ Failed to register listeners with Discord: Registry unavailable"
        );
    });

    test("uses registry from explicit RuntimeContext when provided", async () => {
        mocks.getEnabledModules.mockReturnValue([]);
        mocks.registerDiscoveredListeners.mockReturnValue(0);
        vi.spyOn(console, "log").mockImplementation(() => undefined);
        vi.spyOn(console, "error").mockImplementation(() => undefined);

        const explicitRegistry = { id: "explicit" };
        const listenerRepository = {} as ListenerRepository;
        const useCase = new RegisterListeners(listenerRepository, { registry: explicitRegistry as never });
        await useCase.execute();

        expect(mocks.ListenerRegistrationService).toHaveBeenCalledWith(listenerRepository, explicitRegistry);
    });
});
