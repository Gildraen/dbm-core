import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { CommandRepository } from "app/domain/interface/repository/CommandRepository.js";
import type { RegistryInterface } from "app/domain/interface/registry/RegistryInterface.js";
import type { DescriptorInterface } from "app/domain/interface/registry/DescriptorInterface.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";

let mockRegistry: RegistryInterface;

vi.mock("app/domain/registry/RegistryProvider.js", () => ({
    get registry() { return mockRegistry; },
}));
import { CommandRegistrationService } from "app/domain/service/CommandRegistrationService.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDescriptor(
    key: string,
    kind: string,
    command: Record<string, unknown>
): DescriptorInterface {
    return {
        key,
        kind,
        metadata: {},
        handlerClass: class {
            buildCommand() {
                return command;
            }
        },
    } as unknown as DescriptorInterface;
}

function makeRepository(registeredCount?: number): CommandRepository {
    return {
        registerCommands: vi.fn().mockResolvedValue(registeredCount ?? 0),
        clearAllCommands: vi.fn().mockResolvedValue(0),
        getRegisteredCommands: vi.fn().mockResolvedValue([]),
    };
}

function makeRegistry(
    kindMap: Partial<Record<string, DescriptorInterface[]>> = {}
): RegistryInterface {
    const list = vi.fn((kind?: string) => kindMap[kind ?? ""] ?? []) as unknown as RegistryInterface["list"];
    const get = vi.fn().mockReturnValue(undefined) as unknown as RegistryInterface["get"];
    const has = vi.fn().mockReturnValue(false) as unknown as RegistryInterface["has"];
    const size = vi.fn().mockReturnValue(0) as unknown as RegistryInterface["size"];
    const upsert = vi.fn() as unknown as RegistryInterface["upsert"];
    const remove = vi.fn().mockReturnValue(false) as unknown as RegistryInterface["remove"];
    const clear = vi.fn() as unknown as RegistryInterface["clear"];

    return { list, get, has, size, upsert, remove, clear };
}

const SLASH_CMD = { type: 'slash', name: "ping", description: "Ping the bot" };
const CTX_USER_CMD = { type: 'context:user', name: "Check Profile" };
const CTX_MSG_CMD = { type: 'context:message', name: "Analyze Text" };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CommandRegistrationService", () => {
    beforeEach(() => {
        vi.spyOn(console, "log").mockImplementation(() => undefined);
        vi.spyOn(console, "warn").mockImplementation(() => undefined);
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        mockRegistry = makeRegistry();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // -----------------------------------------------------------------------
    // No commands discovered
    // -----------------------------------------------------------------------

    describe("registerDiscoveredCommands() — no commands", () => {
        test("returns 0 and does not call repository when registry is empty", async () => {
            const repository = makeRepository();
            const registry = makeRegistry();
            mockRegistry = registry;
            const service = new CommandRegistrationService(repository);

            const result = await service.registerDiscoveredCommands();

            expect(result).toBe(0);
            expect(repository.registerCommands as ReturnType<typeof vi.fn>).not.toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining("No commands discovered"));
        });
    });

    // -----------------------------------------------------------------------
    // Building commands — each command kind
    // -----------------------------------------------------------------------

    describe("registerDiscoveredCommands() — command building", () => {
        test("builds and registers one slash command", async () => {
            const descriptor = makeDescriptor("slash:ping", REGISTRY_KINDS.SLASH, SLASH_CMD);
            const repository = makeRepository(1);
            const registry = makeRegistry({
                [REGISTRY_KINDS.SLASH]: [descriptor],
            });
            mockRegistry = registry;
            const service = new CommandRegistrationService(repository);

            const result = await service.registerDiscoveredCommands();

            expect(repository.registerCommands as ReturnType<typeof vi.fn>).toHaveBeenCalledWith([SLASH_CMD]);
            expect(result).toBe(1);
        });

        test("builds and registers one context:user command", async () => {
            const descriptor = makeDescriptor("context:user:Check Profile", REGISTRY_KINDS.CONTEXT_USER, CTX_USER_CMD);
            const repository = makeRepository(1);
            const registry = makeRegistry({
                [REGISTRY_KINDS.CONTEXT_USER]: [descriptor],
            });
            mockRegistry = registry;
            const service = new CommandRegistrationService(repository);

            const result = await service.registerDiscoveredCommands();

            expect(repository.registerCommands as ReturnType<typeof vi.fn>).toHaveBeenCalledWith([CTX_USER_CMD]);
            expect(result).toBe(1);
        });

        test("builds and registers one context:message command", async () => {
            const descriptor = makeDescriptor("context:message:Analyze Text", REGISTRY_KINDS.CONTEXT_MESSAGE, CTX_MSG_CMD);
            const repository = makeRepository(1);
            const registry = makeRegistry({
                [REGISTRY_KINDS.CONTEXT_MESSAGE]: [descriptor],
            });
            mockRegistry = registry;
            const service = new CommandRegistrationService(repository);

            const result = await service.registerDiscoveredCommands();

            expect(repository.registerCommands as ReturnType<typeof vi.fn>).toHaveBeenCalledWith([CTX_MSG_CMD]);
            expect(result).toBe(1);
        });

        test("aggregates commands across all three kinds into a single registerCommands call", async () => {
            const slashDescriptor = makeDescriptor("slash:ping", REGISTRY_KINDS.SLASH, SLASH_CMD);
            const userDescriptor = makeDescriptor("context:user:Check Profile", REGISTRY_KINDS.CONTEXT_USER, CTX_USER_CMD);
            const msgDescriptor = makeDescriptor("context:message:Analyze Text", REGISTRY_KINDS.CONTEXT_MESSAGE, CTX_MSG_CMD);
            const repository = makeRepository(3);
            const registry = makeRegistry({
                [REGISTRY_KINDS.SLASH]: [slashDescriptor],
                [REGISTRY_KINDS.CONTEXT_USER]: [userDescriptor],
                [REGISTRY_KINDS.CONTEXT_MESSAGE]: [msgDescriptor],
            });
            mockRegistry = registry;
            const service = new CommandRegistrationService(repository);

            const result = await service.registerDiscoveredCommands();

            expect(repository.registerCommands as ReturnType<typeof vi.fn>).toHaveBeenCalledWith([
                SLASH_CMD,
                CTX_USER_CMD,
                CTX_MSG_CMD,
            ]);
            expect(result).toBe(3);
        });

        test("returns the count reported by the repository, not the local command count", async () => {
            const descriptor = makeDescriptor("slash:ping", REGISTRY_KINDS.SLASH, SLASH_CMD);
            const repository = makeRepository(0); // repository reports 0 registered
            const registry = makeRegistry({ [REGISTRY_KINDS.SLASH]: [descriptor] });
            mockRegistry = registry;
            const service = new CommandRegistrationService(repository);

            const result = await service.registerDiscoveredCommands();

            expect(result).toBe(0);
        });
    });

    // -----------------------------------------------------------------------
    // Logging
    // -----------------------------------------------------------------------

    describe("registerDiscoveredCommands() — logging", () => {
        test("logs success message when all commands register", async () => {
            const descriptor = makeDescriptor("slash:ping", REGISTRY_KINDS.SLASH, SLASH_CMD);
            const repository = makeRepository(1);
            const registry = makeRegistry({ [REGISTRY_KINDS.SLASH]: [descriptor] });
            mockRegistry = registry;
            const service = new CommandRegistrationService(repository);

            await service.registerDiscoveredCommands();

            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining("Successfully registered all 1 commands")
            );
        });

        test("logs partial warning when not all commands register", async () => {
            const slashDescriptor = makeDescriptor("slash:ping", REGISTRY_KINDS.SLASH, SLASH_CMD);
            const userDescriptor = makeDescriptor("context:user:Check Profile", REGISTRY_KINDS.CONTEXT_USER, CTX_USER_CMD);
            const repository = makeRepository(1); // only 1 of 2 registered
            const registry = makeRegistry({
                [REGISTRY_KINDS.SLASH]: [slashDescriptor],
                [REGISTRY_KINDS.CONTEXT_USER]: [userDescriptor],
            });
            mockRegistry = registry;
            const service = new CommandRegistrationService(repository);

            await service.registerDiscoveredCommands();

            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining("1/2")
            );
        });
    });
});
