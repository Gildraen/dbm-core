import { describe, it, expect, vi, beforeEach } from "vitest";
import { SetupModuleHandlers } from "app/application/useCase/SetupModuleHandlers.js";
import { OperationStatus } from "app/domain/types/OperationStatus.js";
import { config } from "app/domain/config/Config.js";
import { loadModule } from "app/domain/service/ModuleLoader.js";
import type { ListenerRepository } from "app/domain/interface/ListenerRepository.js";
import type { Client } from "discord.js";

vi.mock("app/domain/config/Config.js");
vi.mock("app/domain/service/ModuleLoader.js");

describe("SetupModuleHandlers", () => {
    let mockClient: Client;
    let mockListenerRepository: ListenerRepository;
    let setupModuleHandlers: SetupModuleHandlers;

    beforeEach(() => {
        mockClient = {} as Client;
        mockListenerRepository = {
            registerEventListener: vi.fn(),
            registerInteractionListener: vi.fn(),
            getListenerSummary: vi.fn().mockReturnValue({
                eventListeners: 0,
                interactionListeners: 0,
                total: 0
            })
        };
        setupModuleHandlers = new SetupModuleHandlers(mockListenerRepository, mockClient);
        vi.clearAllMocks();
    });

    it("should successfully setup handlers for modules that have setupHandlers method", async () => {
        const mockModule = {
            name: "test-module",
            setupHandlers: vi.fn()
        };

        vi.mocked(config.getConfig).mockReturnValue({
            "test-module": { enabled: true, settings: {} }
        });
        vi.mocked(loadModule).mockResolvedValue(mockModule);

        const results = await setupModuleHandlers.execute();

        expect(results).toHaveLength(1);
        expect(results[0].moduleName).toBe("test-module");
        expect(results[0].status).toBe(OperationStatus.SUCCESS);
        expect(results[0].durationMs).toBeTypeOf("number");
        expect(mockModule.setupHandlers).toHaveBeenCalledWith();
    });

    it("should successfully setup handlers for modules without setupHandlers method", async () => {
        const mockModule = {
            name: "test-module-no-handlers"
        };

        vi.mocked(config.getConfig).mockReturnValue({
            "test-module-no-handlers": { enabled: true, settings: {} }
        });
        vi.mocked(loadModule).mockResolvedValue(mockModule);

        const results = await setupModuleHandlers.execute();

        expect(results).toHaveLength(1);
        expect(results[0].moduleName).toBe("test-module-no-handlers");
        expect(results[0].status).toBe(OperationStatus.SUCCESS);
        expect(results[0].durationMs).toBeTypeOf("number");
    });

    it("should handle errors during module loading", async () => {
        vi.mocked(config.getConfig).mockReturnValue({
            "failing-module": { enabled: true, settings: {} }
        });
        vi.mocked(loadModule).mockRejectedValue(new Error("Module not found"));

        const results = await setupModuleHandlers.execute();

        expect(results).toHaveLength(1);
        expect(results[0].moduleName).toBe("failing-module");
        expect(results[0].status).toBe(OperationStatus.FAILED);
        expect(results[0].error).toBe("Module not found");
        expect(results[0].durationMs).toBeTypeOf("number");
    });

    it("should handle multiple modules", async () => {
        const mockModule1 = { name: "module1", setupHandlers: vi.fn() };
        const mockModule2 = { name: "module2", setupHandlers: vi.fn() };

        vi.mocked(config.getConfig).mockReturnValue({
            "module1": { enabled: true, settings: {} },
            "module2": { enabled: true, settings: {} },
            "disabled-module": { enabled: false, settings: {} }
        });

        vi.mocked(loadModule)
            .mockResolvedValueOnce(mockModule1)
            .mockResolvedValueOnce(mockModule2);

        const results = await setupModuleHandlers.execute();

        expect(results).toHaveLength(2);
        expect(results[0].moduleName).toBe("module1");
        expect(results[0].status).toBe(OperationStatus.SUCCESS);
        expect(results[1].moduleName).toBe("module2");
        expect(results[1].status).toBe(OperationStatus.SUCCESS);
        expect(mockModule1.setupHandlers).toHaveBeenCalledWith();
        expect(mockModule2.setupHandlers).toHaveBeenCalledWith();
        expect(loadModule).toHaveBeenCalledTimes(2);
    });

    it("should handle no enabled modules", async () => {
        vi.mocked(config.getConfig).mockReturnValue({});

        const results = await setupModuleHandlers.execute();

        expect(results).toHaveLength(0);
    });

    it("should handle mixed success and failure scenarios", async () => {
        const mockModule1 = { name: "module1", setupHandlers: vi.fn() };

        vi.mocked(config.getConfig).mockReturnValue({
            "module1": { enabled: true, settings: {} },
            "failing-module": { enabled: true, settings: {} },
            "module3": { enabled: true, settings: {} }
        });

        vi.mocked(loadModule)
            .mockResolvedValueOnce(mockModule1)
            .mockRejectedValueOnce(new Error("Module failed to load"))
            .mockResolvedValueOnce({ name: "module3" });

        const results = await setupModuleHandlers.execute();

        expect(results).toHaveLength(3);

        // First module should succeed
        expect(results[0].moduleName).toBe("module1");
        expect(results[0].status).toBe(OperationStatus.SUCCESS);

        // Second module should fail
        expect(results[1].moduleName).toBe("failing-module");
        expect(results[1].status).toBe(OperationStatus.FAILED);
        expect(results[1].error).toBe("Module failed to load");

        // Third module should succeed
        expect(results[2].moduleName).toBe("module3");
        expect(results[2].status).toBe(OperationStatus.SUCCESS);

        expect(mockModule1.setupHandlers).toHaveBeenCalledWith();
        expect(loadModule).toHaveBeenCalledTimes(3);
    });
});
