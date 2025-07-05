import { describe, test, expect, vi, beforeEach, type Mock } from "vitest";
import StartMigration from "application/useCase/StartMigration.js";
import { ModuleLoader } from "domain/module/ModuleLoader.js";
import { config } from "domain/config/Config.js";

vi.mock("domain/module/ModuleLoader.js", async () => ({
    ModuleLoader: {
        load: vi.fn(),
    },
}));

vi.mock("domain/config/Config.js", async () => {
    return {
        config: {
            getEnabledModules: vi.fn(),
        },
    };
});

describe("StartMigration", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    test("runs migrate() on a single module in dryRun mode", async () => {
        const mockModule = { name: "test-module", migrate: vi.fn() };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "test-module", config: { enabled: true, settings: {} } },
        ]);

        (ModuleLoader.load as Mock).mockResolvedValue(mockModule);

        const migration = new StartMigration(true); // dryRun: true
        const report = await migration.execute();

        expect(report.results).toEqual([
            { moduleName: "test-module", status: "success" },
        ]);
        expect(mockModule.migrate).not.toHaveBeenCalled();
    });

    test("executes real migration and records duration", async () => {
        const mockMigrate = vi.fn().mockResolvedValue(undefined);
        const mockModule = { name: "test-module", migrate: mockMigrate };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "test-module", config: { enabled: true, settings: {} } },
        ]);

        (ModuleLoader.load as Mock).mockResolvedValue(mockModule);

        const migration = new StartMigration(false);
        const report = await migration.execute();

        expect(mockMigrate).toHaveBeenCalled();
        expect(report.results[0].status).toBe("success");
        expect(report.results[0]).toHaveProperty("durationMs");
    });

    test("skips module with no migrate method", async () => {
        const mockModule = { name: "no-migrate" };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "no-migrate", config: {} },
        ]);

        (ModuleLoader.load as Mock).mockResolvedValue(mockModule);

        const migration = new StartMigration();
        const report = await migration.execute();

        expect(report.results[0]).toEqual({
            moduleName: "no-migrate",
            status: "skipped",
        });
    });

    test("handles error during module load", async () => {
        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "broken-module", config: {} },
        ]);

        (ModuleLoader.load as Mock).mockRejectedValue(new Error("boom"));

        const migration = new StartMigration();
        const report = await migration.execute();

        expect(report.results[0].status).toBe("failed");
        expect(report.results[0].error).toMatch(/boom/);
    });

    test("handles error during module migration", async () => {
        const mockModule = { name: "error-module", migrate: vi.fn(() => { throw new Error("💥 migration error") }) };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "error-module", config: {} },
        ]);

        (ModuleLoader.load as Mock).mockResolvedValue(mockModule);

        const migration = new StartMigration();
        const report = await migration.execute();

        expect(report.results[0]).toEqual({
            moduleName: "error-module",
            status: "failed",
            error: "💥 migration error",
        });
    });

    test("generates a full snapshot report with mixed results", async () => {
        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "mod-ok", config: {} },
            { name: "mod-fail", config: {} },
            { name: "mod-skip", config: {} },
        ]);

        (ModuleLoader.load as Mock)
            .mockResolvedValueOnce({ name: "mod-ok", migrate: vi.fn() })
            .mockResolvedValueOnce({ name: "mod-fail", migrate: vi.fn(() => { throw new Error("💥 fail") }) })
            .mockResolvedValueOnce({ name: "mod-skip" });

        const start = new StartMigration(false);
        const report = await start.execute();

        expect(report).toMatchObject({
            results: [
                {
                    moduleName: "mod-ok",
                    status: "success",
                    durationMs: expect.any(Number),
                },
                {
                    moduleName: "mod-fail",
                    status: "failed",
                    error: "💥 fail",
                },
                {
                    moduleName: "mod-skip",
                    status: "skipped",
                },
            ],
            successCount: 1,
            failureCount: 1,
            skippedCount: 1,
            totalDurationMs: expect.any(Number),
        });
    });

    test("handles empty module list gracefully", async () => {
        (config.getEnabledModules as Mock).mockReturnValue([]);

        const migration = new StartMigration();
        const report = await migration.execute();

        expect(report.results).toEqual([]);
        expect(report.successCount).toBe(0);
        expect(report.failureCount).toBe(0);
        expect(report.skippedCount).toBe(0);
        expect(report.totalDurationMs).toBeGreaterThanOrEqual(0);
    });

    test("handles modules with no configuration", async () => {
        const mockModule = { name: "no-config-module", migrate: vi.fn() };

        (config.getEnabledModules as Mock).mockReturnValue([
            { name: "no-config-module" },
        ]);

        (ModuleLoader.load as Mock).mockResolvedValue(mockModule);

        const migration = new StartMigration();
        const report = await migration.execute();

        expect(report.results[0]).toEqual({
            moduleName: "no-config-module",
            status: "success",
            durationMs: expect.any(Number),
        });
    });
});
