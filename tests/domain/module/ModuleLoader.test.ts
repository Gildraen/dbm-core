import { describe, expect, test, vi } from "vitest";
import { ModuleLoader } from "domain/module/ModuleLoader.js";

vi.mock("valid-module", () => ({
    default: {
        name: "valid-module",
        migrate: async () => { },
    },
}));

vi.mock("missing-method-module", () => ({
    default: {
        name: "bad-module",
    },
}));

vi.mock("non-object-module", () => ({
    default: "just a string",
}));

describe("ModuleLoader", () => {
    test("loads a valid module", async () => {
        const mod = await ModuleLoader.load("valid-module");

        expect(mod.name).toBe("valid-module");
        expect(typeof mod.migrate).toBe("function");
    });

    test("fails if module doesn't exist", async () => {
        await expect(ModuleLoader.load("non-existent-module"))
            .rejects
            .toThrowErrorMatchingInlineSnapshot(`[Error: Failed to load module "non-existent-module": Cannot find package 'non-existent-module' imported from '/workspaces/core/src/domain/module/ModuleLoader.ts']`);
    });

    test("fails if module doesn't implement interface", async () => {
        await expect(ModuleLoader.load("missing-method-module"))
            .rejects
            .toThrowErrorMatchingInlineSnapshot(`[Error: Failed to load module "missing-method-module": Module "missing-method-module" does not implement ModuleInterface]`);
    });

    test("fails if module exports a non-object", async () => {
        await expect(ModuleLoader.load("non-object-module"))
            .rejects
            .toThrowErrorMatchingInlineSnapshot(`[Error: Failed to load module "non-object-module": Module "non-object-module" does not implement ModuleInterface]`);
    });
});
