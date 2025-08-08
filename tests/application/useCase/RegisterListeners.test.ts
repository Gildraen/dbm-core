import { describe, test, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { RegisterListeners } from "app/application/useCase/RegisterListeners.js";
import { config } from "app/domain/config/Config.js";
import { loadModule } from "app/domain/service/ModuleLoader.js";
import type { ListenerRepository } from "app/domain/interface/ListenerRepository.js";

vi.mock("app/domain/config/Config.js", () => {
    return {
        config: {
            getEnabledModules: vi.fn(),
        },
    };
});

vi.mock("app/domain/service/ModuleLoader.js", () => ({
    loadModule: vi.fn(),
}));

describe("RegisterListeners", () => {
    let mockListenerRepository: ListenerRepository;
    let consoleSpy: ReturnType<typeof vi.spyOn>;
    let registerListeners: RegisterListeners;

    beforeEach(() => {
        vi.resetAllMocks();
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        mockListenerRepository = {
            registerEventHandlerClass: vi.fn().mockResolvedValue(undefined),
            registerEventListener: vi.fn(),
            registerInteractionListener: vi.fn(),
            getListenerSummary: vi.fn().mockReturnValue({ eventListeners: 0, interactionListeners: 0, total: 0 }),
        };
        registerListeners = new RegisterListeners(mockListenerRepository);
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    test("should successfully discover listeners for modules that have discoverListeners method", async () => {
        const mockModule = {
            name: "test-module",
            discoverListeners: vi.fn().mockResolvedValue(undefined)
        };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "test-module", config: { enabled: true, settings: {} } }
        ]);
        (loadModule as Mock).mockResolvedValue(mockModule);

        await registerListeners.execute();

        expect(mockModule.discoverListeners).toHaveBeenCalledWith();
        expect(consoleSpy).not.toHaveBeenCalled();
    });

    test("should successfully discover listeners for modules without discoverListeners method", async () => {
        const mockModule = {
            name: "test-module"
        };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "test-module", config: { enabled: true, settings: {} } }
        ]);
        (loadModule as Mock).mockResolvedValue(mockModule);

        await registerListeners.execute();

        expect(consoleSpy).not.toHaveBeenCalled();
    });

    test("should handle errors during module loading", async () => {
        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "broken-module", config: { enabled: true, settings: {} } }
        ]);
        (loadModule as Mock).mockRejectedValue(new Error("Module load error"));

        await registerListeners.execute();

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('Failed to discover listeners for module "broken-module": Module load error')
        );
    });

    test("should handle multiple modules", async () => {
        const mockModule1 = {
            name: "module1",
            discoverListeners: vi.fn().mockResolvedValue(undefined)
        };

        const mockModule2 = {
            name: "module2",
            discoverListeners: vi.fn().mockResolvedValue(undefined)
        };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "module1", config: { enabled: true, settings: {} } },
            { name: "module2", config: { enabled: true, settings: {} } }
        ]);
        (loadModule as Mock)
            .mockResolvedValueOnce(mockModule1)
            .mockResolvedValueOnce(mockModule2);

        await registerListeners.execute();

        expect(mockModule1.discoverListeners).toHaveBeenCalledWith();
        expect(mockModule2.discoverListeners).toHaveBeenCalledWith();
        expect(consoleSpy).not.toHaveBeenCalled();
    });

    test("should handle no enabled modules", async () => {
        (config.getEnabledModules as Mock).mockReturnValue([]);

        await registerListeners.execute();

        expect(loadModule).not.toHaveBeenCalled();
        expect(consoleSpy).not.toHaveBeenCalled();
    });

    test("should handle mixed success and failure scenarios", async () => {
        const mockModule = {
            name: "good-module",
            discoverListeners: vi.fn().mockResolvedValue(undefined)
        };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "broken-module", config: { enabled: true, settings: {} } },
            { name: "good-module", config: { enabled: true, settings: {} } }
        ]);
        (loadModule as Mock)
            .mockRejectedValueOnce(new Error("Load failed"))
            .mockResolvedValueOnce(mockModule);

        await registerListeners.execute();

        expect(mockModule.discoverListeners).toHaveBeenCalledWith();
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('Failed to discover listeners for module "broken-module": Load failed')
        );
    });


    test("should handle no enabled modules", async () => {
        (config.getEnabledModules as Mock).mockReturnValue([]);

        await registerListeners.execute();

        expect(consoleSpy).not.toHaveBeenCalled();
    });

    test("should handle success for one module and failure for another", async () => {
        const mockSuccessModule = {
            name: "success-module",
            discoverListeners: vi.fn().mockResolvedValue(undefined)
        };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "success-module", config: { enabled: true, settings: {} } },
            { name: "fail-module", config: { enabled: true, settings: {} } }
        ]);
        (loadModule as Mock)
            .mockResolvedValueOnce(mockSuccessModule)
            .mockRejectedValueOnce(new Error("Failed to load"));

        await registerListeners.execute();

        expect(mockSuccessModule.discoverListeners).toHaveBeenCalledWith();
        expect(consoleSpy).toHaveBeenCalledWith(
            '❌ Failed to discover listeners for module "fail-module": Failed to load'
        );
    });
});
