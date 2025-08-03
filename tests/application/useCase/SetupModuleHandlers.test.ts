import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Client } from "discord.js";
import SetupModuleHandlers from "app/application/useCase/SetupModuleHandlers.js";
import { OperationStatus } from "app/domain/types/OperationStatus.js";
import { config } from "app/domain/config/Config.js";
import { loadModule } from "app/domain/service/ModuleLoader.js";

// Mock dependencies
vi.mock("app/domain/config/Config.js");
vi.mock("app/domain/service/ModuleLoader.js");

describe("SetupModuleHandlers", () => {
    let mockClient: Client;
    let setupModuleHandlers: SetupModuleHandlers;

    beforeEach(() => {
        mockClient = {} as Client;
        setupModuleHandlers = new SetupModuleHandlers(mockClient);
        vi.clearAllMocks();
    });

    it("should successfully setup handlers for modules that have setupHandlers method", async () => {
        const mockModule = {
            name: "test-module",
            setupHandlers: vi.fn()
        };

        vi.mocked(config.getEnabledModules).mockReturnValue([
            { name: "test-module", config: { enabled: true, settings: {} } }
        ]);
        vi.mocked(loadModule).mockResolvedValue(mockModule);

        const result = await setupModuleHandlers.execute();

        expect(result.results).toHaveLength(1);
        expect(result.results[0]).toEqual({
            moduleName: "test-module",
            status: OperationStatus.SUCCESS,
            durationMs: expect.any(Number)
        });
        expect(result.successCount).toBe(1);
        expect(result.failureCount).toBe(0);
        expect(mockModule.setupHandlers).toHaveBeenCalledWith(mockClient);
    });

    it("should succeed for modules without setupHandlers method", async () => {
        const mockModule = {
            name: "test-module-no-handlers"
        };

        vi.mocked(config.getEnabledModules).mockReturnValue([
            { name: "test-module-no-handlers", config: { enabled: true, settings: {} } }
        ]);
        vi.mocked(loadModule).mockResolvedValue(mockModule);

        const result = await setupModuleHandlers.execute();

        expect(result.results).toHaveLength(1);
        expect(result.results[0]).toEqual({
            moduleName: "test-module-no-handlers",
            status: OperationStatus.SUCCESS,
            durationMs: expect.any(Number)
        });
        expect(result.successCount).toBe(1);
        expect(result.failureCount).toBe(0);
    });

    it("should handle errors during handler setup", async () => {
        const mockModule = {
            name: "failing-module",
            setupHandlers: vi.fn().mockImplementation(() => {
                throw new Error("Handler setup failed");
            })
        };

        vi.mocked(config.getEnabledModules).mockReturnValue([
            { name: "failing-module", config: { enabled: true, settings: {} } }
        ]);
        vi.mocked(loadModule).mockResolvedValue(mockModule);

        const result = await setupModuleHandlers.execute();

        expect(result.results).toHaveLength(1);
        expect(result.results[0]).toEqual({
            moduleName: "failing-module",
            status: OperationStatus.FAILED,
            error: "Handler setup failed"
        });
        expect(result.successCount).toBe(0);
        expect(result.failureCount).toBe(1);
    });

    it("should handle module loading errors", async () => {
        vi.mocked(config.getEnabledModules).mockReturnValue([
            { name: "bad-module", config: { enabled: true, settings: {} } }
        ]);
        vi.mocked(loadModule).mockRejectedValue(new Error("Failed to load module"));

        const result = await setupModuleHandlers.execute();

        expect(result.results).toHaveLength(1);
        expect(result.results[0]).toEqual({
            moduleName: "bad-module",
            status: OperationStatus.FAILED,
            error: "Failed to load module"
        });
        expect(result.successCount).toBe(0);
        expect(result.failureCount).toBe(1);
    });

    it("should process multiple modules and return comprehensive report", async () => {
        const module1 = { name: "module-1", setupHandlers: vi.fn() };
        const module2 = { name: "module-2" }; // No handlers
        const module3 = {
            name: "module-3",
            setupHandlers: vi.fn().mockImplementation(() => { throw new Error("Setup failed") })
        };

        vi.mocked(config.getEnabledModules).mockReturnValue([
            { name: "module-1", config: { enabled: true, settings: {} } },
            { name: "module-2", config: { enabled: true, settings: {} } },
            { name: "module-3", config: { enabled: true, settings: {} } }
        ]);

        vi.mocked(loadModule)
            .mockResolvedValueOnce(module1)
            .mockResolvedValueOnce(module2)
            .mockResolvedValueOnce(module3);

        const result = await setupModuleHandlers.execute();

        expect(result.results).toHaveLength(3);
        expect(result.successCount).toBe(2);
        expect(result.failureCount).toBe(1);
        expect(result.totalDurationMs).toBeGreaterThanOrEqual(0);
    });

    it("should work with empty module list", async () => {
        vi.mocked(config.getEnabledModules).mockReturnValue([]);

        const result = await setupModuleHandlers.execute();

        expect(result.results).toHaveLength(0);
        expect(result.successCount).toBe(0);
        expect(result.failureCount).toBe(0);
    });
});
