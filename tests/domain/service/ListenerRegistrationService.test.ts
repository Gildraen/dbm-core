import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { ListenerRepository } from "app/domain/interface/repository/ListenerRepository.js";
import type { PlatformRegistryReaderInterface } from "app/domain/interface/registry/PlatformRegistryReaderInterface.js";
import type { DescriptorInterface } from "app/domain/interface/registry/DescriptorInterface.js";
import type { Interaction } from "app/domain/interface/InteractionHandler.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";
import { Keys } from "app/domain/keys/Keys.js";
import { ListenerRegistrationService } from "app/domain/service/ListenerRegistrationService.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDescriptor(
    key: string,
    kind: string,
    opts: { once?: boolean } = {}
): { descriptor: DescriptorInterface; handleSpy: ReturnType<typeof vi.fn> } {
    const handleSpy = vi.fn().mockResolvedValue(undefined);
    return {
        handleSpy,
        descriptor: {
            key,
            kind: kind as typeof REGISTRY_KINDS[keyof typeof REGISTRY_KINDS],
            metadata: { once: opts.once } as Record<string, unknown>,
            handlerClass: class {
                handle = handleSpy;
            },
        } as unknown as DescriptorInterface,
    };
}

function makeRepository(): {
    repository: ListenerRepository;
    getRouterHandler: () => (interaction: Interaction) => Promise<unknown>;
} {
    let capturedHandler: ((interaction: Interaction) => Promise<unknown>) | undefined;
    const repository: ListenerRepository = {
        registerInteractionListener: vi.fn((handler) => {
            capturedHandler = handler;
        }),
        registerEventHandlerClass: vi.fn(),
        registerEventListener: vi.fn(),
        getListenerSummary: vi.fn().mockReturnValue({ eventListeners: 0, interactionListeners: 0, total: 0 }),
    } as unknown as ListenerRepository;
    return {
        repository,
        getRouterHandler: () => {
            if (!capturedHandler) throw new Error("registerInteractionListener was not called");
            return capturedHandler;
        },
    };
}

function makeRegistry(overrides: Partial<PlatformRegistryReaderInterface> = {}): PlatformRegistryReaderInterface {
    return {
        get: vi.fn().mockReturnValue(undefined),
        list: vi.fn().mockReturnValue([]),
        has: vi.fn().mockReturnValue(false),
        size: vi.fn().mockReturnValue(0),
        ...overrides,
    };
}

const STUB_USER = { id: "1", username: "u", displayName: "u", globalName: "u", bot: false };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ListenerRegistrationService", () => {
    beforeEach(() => {
        vi.spyOn(console, "log").mockImplementation(() => undefined);
        vi.spyOn(console, "warn").mockImplementation(() => undefined);
        vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // -----------------------------------------------------------------------
    // registerDiscoveredListeners()
    // -----------------------------------------------------------------------

    describe("registerDiscoveredListeners()", () => {
        test("registers the interaction router and returns 1 when no event listeners", () => {
            const { repository } = makeRepository();
            const registry = makeRegistry();
            const service = new ListenerRegistrationService(repository, registry);

            const total = service.registerDiscoveredListeners();

            expect((repository.registerInteractionListener as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(1);
            expect(total).toBe(1);
        });

        test("returns 1 + N when N event descriptors are found", () => {
            const { descriptor: evt1 } = makeDescriptor(Keys.event("messageCreate"), REGISTRY_KINDS.EVENT);
            const { descriptor: evt2 } = makeDescriptor(Keys.event("guildMemberAdd"), REGISTRY_KINDS.EVENT);
            const registry = makeRegistry({
                list: vi.fn().mockReturnValue([evt1, evt2]),
            });
            const { repository } = makeRepository();
            const service = new ListenerRegistrationService(repository, registry);

            const total = service.registerDiscoveredListeners();

            expect(total).toBe(3); // 1 router + 2 event listeners
            expect((repository.registerEventHandlerClass as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(2);
        });

        test("isolates event listener failures and continues registering remaining listeners", () => {
            const { descriptor: goodDescriptor } = makeDescriptor(Keys.event("messageCreate"), REGISTRY_KINDS.EVENT);
            const badDescriptor = {
                key: "evt:bad",
                kind: REGISTRY_KINDS.EVENT,
                metadata: {},
                // Providing an invalid key so extractEventName throws
                get handlerClass(): never { throw new Error("boom"); },
            } as unknown as DescriptorInterface;

            const registry = makeRegistry({
                list: vi.fn().mockReturnValue([badDescriptor, goodDescriptor]),
            });
            const { repository } = makeRepository();
            const service = new ListenerRegistrationService(repository, registry);

            const total = service.registerDiscoveredListeners();

            // 1 router + 1 successful event listener (bad one skipped)
            expect(total).toBe(2);
            expect(console.error).toHaveBeenCalled();
        });

        test("isolates interaction router failure and returns 0 listeners from router", () => {
            const registry = makeRegistry();
            const repository: ListenerRepository = {
                registerInteractionListener: vi.fn(() => { throw new Error("router failed"); }),
                registerEventHandlerClass: vi.fn(),
                registerEventListener: vi.fn(),
                getListenerSummary: vi.fn().mockReturnValue({ eventListeners: 0, interactionListeners: 0, total: 0 }),
            } as unknown as ListenerRepository;
            const service = new ListenerRegistrationService(repository, registry);

            const total = service.registerDiscoveredListeners();

            expect(total).toBe(0);
            expect(console.error).toHaveBeenCalled();
        });
    });

    // -----------------------------------------------------------------------
    // Event listener registration — once flag
    // -----------------------------------------------------------------------

    describe("event listener once flag propagation", () => {
        test("passes once=true when event metadata.once is true", () => {
            const { descriptor } = makeDescriptor(Keys.event("ready"), REGISTRY_KINDS.EVENT, { once: true });
            const registry = makeRegistry({ list: vi.fn().mockReturnValue([descriptor]) });
            const { repository } = makeRepository();
            const service = new ListenerRegistrationService(repository, registry);

            service.registerDiscoveredListeners();

            expect(repository.registerEventHandlerClass as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
                "ready",
                descriptor.handlerClass,
                true
            );
        });

        test("passes once=undefined when event metadata.once is not set", () => {
            const { descriptor } = makeDescriptor(Keys.event("messageCreate"), REGISTRY_KINDS.EVENT);
            const registry = makeRegistry({ list: vi.fn().mockReturnValue([descriptor]) });
            const { repository } = makeRepository();
            const service = new ListenerRegistrationService(repository, registry);

            service.registerDiscoveredListeners();

            expect(repository.registerEventHandlerClass as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(
                "messageCreate",
                descriptor.handlerClass,
                undefined
            );
        });
    });

    // -----------------------------------------------------------------------
    // Interaction routing (tested via the registered router handler)
    // -----------------------------------------------------------------------

    describe("interaction routing", () => {
        async function getHandler(
            registry: PlatformRegistryReaderInterface
        ): Promise<(interaction: Interaction) => Promise<unknown>> {
            const { repository, getRouterHandler } = makeRepository();
            const service = new ListenerRegistrationService(repository, registry);
            service.registerDiscoveredListeners();
            return getRouterHandler();
        }

        test("routes slash interaction to handler via slash key", async () => {
            const { descriptor, handleSpy } = makeDescriptor(Keys.slash("ping"), REGISTRY_KINDS.SLASH);
            const registry = makeRegistry({
                get: vi.fn().mockReturnValue(descriptor),
            });
            const handler = await getHandler(registry);

            await handler({ type: "slash", commandName: "ping", user: STUB_USER, id: "1" });

            expect(registry.get as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(Keys.slash("ping"));
            expect(handleSpy).toHaveBeenCalledTimes(1);
        });

        test("routes slash interaction with subcommand group + subcommand to composite key", async () => {
            const key = Keys.slash("admin", "user", "ban");
            const { descriptor, handleSpy } = makeDescriptor(key, REGISTRY_KINDS.SLASH);
            const registry = makeRegistry({
                get: vi.fn().mockReturnValue(descriptor),
            });
            const handler = await getHandler(registry);

            await handler({
                type: "slash",
                commandName: "admin",
                subcommandGroup: "user",
                subcommand: "ban",
                user: STUB_USER,
                id: "1",
            });

            expect(registry.get as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(key);
            expect(handleSpy).toHaveBeenCalledTimes(1);
        });

        test("routes context:user interaction to handler via contextUser key", async () => {
            const key = Keys.contextUser("Check Profile");
            const { descriptor, handleSpy } = makeDescriptor(key, REGISTRY_KINDS.CONTEXT_USER);
            const registry = makeRegistry({ get: vi.fn().mockReturnValue(descriptor) });
            const handler = await getHandler(registry);

            await handler({ type: "context:user", commandName: "Check Profile", user: STUB_USER, id: "1" });

            expect(registry.get as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(key);
            expect(handleSpy).toHaveBeenCalledTimes(1);
        });

        test("routes context:message interaction to handler via contextMessage key", async () => {
            const key = Keys.contextMessage("Analyze Text");
            const { descriptor, handleSpy } = makeDescriptor(key, REGISTRY_KINDS.CONTEXT_MESSAGE);
            const registry = makeRegistry({ get: vi.fn().mockReturnValue(descriptor) });
            const handler = await getHandler(registry);

            await handler({ type: "context:message", commandName: "Analyze Text", user: STUB_USER, id: "1" });

            expect(registry.get as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(key);
            expect(handleSpy).toHaveBeenCalledTimes(1);
        });

        test("routes component interaction via namespaced key when it exists", async () => {
            const namespacedKey = Keys.component({ namespace: "string-select", id: "poll" });
            const { descriptor, handleSpy } = makeDescriptor(namespacedKey, REGISTRY_KINDS.STRING_SELECT);
            const getMock = vi.fn().mockReturnValue(descriptor);
            const hasMock = vi.fn().mockReturnValue(true); // namespaced key exists
            const registry = makeRegistry({ get: getMock, has: hasMock });
            const handler = await getHandler(registry);

            await handler({ type: "component", customId: "poll", componentType: "string-select", user: STUB_USER, id: "1" });

            expect(hasMock).toHaveBeenCalledWith(namespacedKey);
            expect(getMock).toHaveBeenCalledWith(namespacedKey);
            expect(handleSpy).toHaveBeenCalledTimes(1);
        });

        test("falls back to legacy key when namespaced key is absent", async () => {
            const legacyKey = Keys.component({ id: "poll" });
            const { descriptor, handleSpy } = makeDescriptor(legacyKey, REGISTRY_KINDS.STRING_SELECT);
            const namespacedKey = Keys.component({ namespace: "string-select", id: "poll" });
            const hasMock = vi.fn().mockReturnValue(false); // namespaced key does NOT exist
            const getMock = vi.fn((key: string) => (key === legacyKey ? descriptor : undefined));
            const registry = makeRegistry({ get: getMock, has: hasMock });
            const handler = await getHandler(registry);

            await handler({ type: "component", customId: "poll", componentType: "string-select", user: STUB_USER, id: "1" });

            expect(hasMock).toHaveBeenCalledWith(namespacedKey);
            expect(getMock).toHaveBeenCalledWith(legacyKey);
            expect(handleSpy).toHaveBeenCalledTimes(1);
        });

        test("routes component interaction without componentType via legacy key", async () => {
            const legacyKey = Keys.component({ id: "confirm" });
            const { descriptor, handleSpy } = makeDescriptor(legacyKey, REGISTRY_KINDS.BUTTON);
            const registry = makeRegistry({ get: vi.fn().mockReturnValue(descriptor) });
            const handler = await getHandler(registry);

            await handler({ type: "component", customId: "confirm", user: STUB_USER, id: "1" });

            expect(registry.get as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(legacyKey);
            expect(handleSpy).toHaveBeenCalledTimes(1);
        });

        test("routes autocomplete interaction via option-specific key", async () => {
            const key = Keys.autocomplete(Keys.slash("search"), "query");
            const { descriptor, handleSpy } = makeDescriptor(key, REGISTRY_KINDS.AUTOCOMPLETE);
            const registry = makeRegistry({ get: vi.fn().mockReturnValue(descriptor) });
            const handler = await getHandler(registry);

            await handler({
                type: "autocomplete",
                commandName: "search",
                focusedOption: { name: "query", value: "" },
                user: STUB_USER,
                id: "1",
            });

            expect(registry.get as ReturnType<typeof vi.fn>).toHaveBeenCalledWith(key);
            expect(handleSpy).toHaveBeenCalledTimes(1);
        });

        test("falls back to base command key for autocomplete when option key has no handler", async () => {
            const fallbackKey = Keys.autocomplete(Keys.slash("search"));
            const { descriptor, handleSpy } = makeDescriptor(fallbackKey, REGISTRY_KINDS.AUTOCOMPLETE);
            const getMock = vi.fn((key: string) => (key === fallbackKey ? descriptor : undefined));
            const registry = makeRegistry({ get: getMock });
            const handler = await getHandler(registry);

            await handler({
                type: "autocomplete",
                commandName: "search",
                focusedOption: { name: "query", value: "" },
                user: STUB_USER,
                id: "1",
            });

            // First call: option-specific key → undefined; second call: fallback key → descriptor
            expect(getMock).toHaveBeenCalledWith(Keys.autocomplete(Keys.slash("search"), "query"));
            expect(getMock).toHaveBeenCalledWith(fallbackKey);
            expect(handleSpy).toHaveBeenCalledTimes(1);
        });

        test("logs a warning when no handler is found for an interaction", async () => {
            const registry = makeRegistry({ get: vi.fn().mockReturnValue(undefined) });
            const handler = await getHandler(registry);

            await handler({ type: "slash", commandName: "unknown", user: STUB_USER, id: "1" });

            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining("No handler found")
            );
        });

        test("logs error and does not throw for component interaction with missing customId", async () => {
            const registry = makeRegistry();
            const handler = await getHandler(registry);

            await expect(
                handler({ type: "component", user: STUB_USER, id: "1" })
            ).resolves.toBeUndefined();
            expect(console.error).toHaveBeenCalled();
        });

        test("logs error and does not throw for slash interaction with missing commandName", async () => {
            const registry = makeRegistry();
            const handler = await getHandler(registry);

            await expect(
                handler({ type: "slash", user: STUB_USER, id: "1" })
            ).resolves.toBeUndefined();
            expect(console.error).toHaveBeenCalled();
        });
    });

    // -----------------------------------------------------------------------
    // getRegistrationSummary()
    // -----------------------------------------------------------------------

    describe("getRegistrationSummary()", () => {
        test("returns aggregated counts from the registry", () => {
            const sizeMock = vi.fn((kind?: string) => {
                if (kind === REGISTRY_KINDS.EVENT) return 2;
                if (kind === REGISTRY_KINDS.SLASH) return 3;
                if (kind === REGISTRY_KINDS.CONTEXT_USER) return 1;
                if (kind === REGISTRY_KINDS.CONTEXT_MESSAGE) return 1;
                if (kind === REGISTRY_KINDS.STRING_SELECT) return 2;
                if (kind === REGISTRY_KINDS.AUTOCOMPLETE) return 4;
                return 0;
            });
            const registry = makeRegistry({ size: sizeMock });
            const { repository } = makeRepository();
            const service = new ListenerRegistrationService(repository, registry);

            const summary = service.getRegistrationSummary();

            expect(summary.events).toBe(2);
            expect(summary.slashCommands).toBe(3);
            expect(summary.contextMenus).toBe(2); // user + message
            expect(summary.components).toBe(2);   // only STRING_SELECT returns 2, rest 0
            expect(summary.autocomplete).toBe(4);
        });
    });
});
