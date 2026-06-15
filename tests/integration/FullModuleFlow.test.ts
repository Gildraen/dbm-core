import { beforeEach, describe, expect, test, vi } from "vitest";
import { RegisterCommands } from "app/application/useCase/RegisterCommands.js";
import { RegisterListeners } from "app/application/useCase/RegisterListeners.js";
import { registry } from "app/domain/registry/RegistryProvider.js";
import { InMemoryCommandRepository } from "app/infrastructure/inmemory/repository/InMemoryCommandRepository.js";
import { InMemoryListenerRepository } from "app/infrastructure/inmemory/repository/InMemoryListenerRepository.js";

const mocks = vi.hoisted(() => ({
    getEnabledModules: vi.fn(),
}));

vi.mock("app/domain/config/Config.js", () => ({
    config: {
        getEnabledModules: mocks.getEnabledModules,
    },
}));

vi.mock("sample-full-module", async () => import("./fixtures/SampleModule.js"));

describe("Full Module Flow", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        registry.clear();

        mocks.getEnabledModules.mockReturnValue([
            { name: "sample-full-module", config: { enabled: true, settings: {} } },
        ]);
    });

    test("loads module, registers handlers, and executes command + event end-to-end", async () => {
        const commandRepository = new InMemoryCommandRepository();
        const listenerRepository = new InMemoryListenerRepository();

        await new RegisterCommands(commandRepository).execute();
        await new RegisterListeners(listenerRepository).execute();

        const registeredCommands = await commandRepository.getRegisteredCommands();
        expect(registeredCommands).toHaveLength(1);

        expect(listenerRepository.getListenerSummary()).toEqual({
            eventListeners: 1,
            interactionListeners: 1,
            total: 2,
        });

        let readyTriggered = false;
        await listenerRepository.emit("ready", { mark: () => { readyTriggered = true; } });
        expect(readyTriggered).toBe(true);

        const reply = vi.fn().mockResolvedValue(undefined);
        await listenerRepository.dispatch({
            id: "interaction-1",
            type: "slash",
            commandName: "ping",
            reply,
        });
    });
});
