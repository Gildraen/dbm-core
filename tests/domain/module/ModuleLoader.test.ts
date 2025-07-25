import { loadModule } from "app/domain/service/ModuleLoader.js";
import { register } from "module";
import { describe, expect, test, vi } from "vitest";

vi.mock("valid-module", () => ({
    name: "valid-module",
    migrate: vi.fn(() => "Migration complete"),
    register: vi.fn(() => "Registration complete"),
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
        const mod = await loadModule("valid-module");

        expect(mod.name).toBe("valid-module");
        expect(typeof mod.migrate).toBe("function");
    });

    test("fails if module doesn't exist", async () => {
        await expect(loadModule("non-existent-module"))
            .rejects
            .toThrowErrorMatchingInlineSnapshot(`[Error: Failed to load module "non-existent-module": Cannot find package 'non-existent-module' imported from '/workspaces/core/src/domain/service/ModuleLoader.ts']`);
    });

    test("fails if module doesn't implement interface", async () => {
        await expect(loadModule("missing-method-module"))
            .rejects
            .toThrowErrorMatchingInlineSnapshot(`[Error: Failed to load module "missing-method-module": Module "missing-method-module" does not implement ModuleInterface]`);
    });

    test("fails if module exports a non-object", async () => {
        await expect(loadModule("non-object-module"))
            .rejects
            .toThrowErrorMatchingInlineSnapshot(`[Error: Failed to load module "non-object-module": Module "non-object-module" does not implement ModuleInterface]`);
    });
});
