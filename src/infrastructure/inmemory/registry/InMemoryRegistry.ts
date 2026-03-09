/**
 * In-memory registry implementation
 * Infrastructure layer - concrete implementation using Map storage
 */

import type { PlatformRegistryInterface } from "app/domain/interface/registry/PlatformRegistryInterface.js";
import type { DescriptorInterface } from "app/domain/interface/registry/DescriptorInterface.js";
import type { Kind, RegistryKey } from "app/domain/interface/registry/types.js";
import { REGISTRY_KINDS } from "app/domain/interface/registry/types.js";

/**
 * In-memory registry implementation for storing command/listener descriptors
 * Uses a Map for fast lookups and provides type-safe access
 */
export class InMemoryRegistry implements PlatformRegistryInterface {
    private readonly descriptors = new Map<RegistryKey, DescriptorInterface>();

    // PlatformRegistryWriter implementation
    upsert<K extends Kind = Kind>(descriptor: DescriptorInterface<K>): void {
        const existing = this.descriptors.get(descriptor.key);
        if (existing) {
            console.warn(`⚠️  Overwriting registration for key: ${descriptor.key}`);
        }

        this.descriptors.set(descriptor.key, descriptor);
        console.log(`✅ Registered ${descriptor.kind}: ${descriptor.key}`);
    }

    remove(key: RegistryKey): boolean {
        const existed = this.descriptors.has(key);
        if (existed) {
            this.descriptors.delete(key);
            console.log(`🗑️  Removed registration: ${key}`);
        }
        return existed;
    }

    clear(kind?: Kind): void {
        if (kind) {
            // Clear only specific kind
            const keysToRemove: RegistryKey[] = [];
            for (const [key, descriptor] of this.descriptors.entries()) {
                if (descriptor.kind === kind) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => this.descriptors.delete(key));
            console.log(`🧹 Cleared ${keysToRemove.length} registrations of kind: ${kind}`);
        } else {
            // Clear all
            const count = this.descriptors.size;
            this.descriptors.clear();
            console.log(`🧹 Cleared all ${count} registrations`);
        }
    }

    // PlatformRegistryReader implementation
    get<K extends Kind = Kind>(key: RegistryKey): DescriptorInterface<K> | undefined {
        return this.descriptors.get(key) as DescriptorInterface<K> | undefined;
    }

    list<K extends Kind = Kind>(kind?: K): ReadonlyArray<DescriptorInterface<K>> {
        const all = Array.from(this.descriptors.values());
        if (kind) {
            return all.filter(descriptor => descriptor.kind === kind) as DescriptorInterface<K>[];
        }
        return all as DescriptorInterface<K>[];
    }

    has(key: RegistryKey): boolean {
        return this.descriptors.has(key);
    }

    size(kind?: Kind): number {
        if (kind) {
            return this.list(kind).length;
        }
        return this.descriptors.size;
    }

    /**
     * Get registration summary for diagnostic purposes
     */
    getSummary(): Record<Kind, number> {
        const summary: Partial<Record<Kind, number>> = {};

        for (const descriptor of this.descriptors.values()) {
            summary[descriptor.kind] = (summary[descriptor.kind] || 0) + 1;
        }

        // Ensure all kinds are represented
        const allKinds: Kind[] = [
            // Commands
            REGISTRY_KINDS.SLASH,
            REGISTRY_KINDS.CONTEXT_USER,
            REGISTRY_KINDS.CONTEXT_MESSAGE,
            // Listeners
            REGISTRY_KINDS.AUTOCOMPLETE,
            REGISTRY_KINDS.EVENT,
            // Components
            REGISTRY_KINDS.STRING_SELECT,
            REGISTRY_KINDS.USER_SELECT,
            REGISTRY_KINDS.ROLE_SELECT,
            REGISTRY_KINDS.CHANNEL_SELECT,
            REGISTRY_KINDS.MENTIONABLE_SELECT,
            REGISTRY_KINDS.BUTTON,
            REGISTRY_KINDS.MODAL,
        ];
        for (const kind of allKinds) {
            summary[kind] = summary[kind] || 0;
        }

        return summary as Record<Kind, number>;
    }

    /**
     * Debug: list all registrations
     */
    debugList(): void {
        console.log(`📋 Registry contains ${this.descriptors.size} registrations:`);
        for (const [key, descriptor] of this.descriptors.entries()) {
            console.log(`  - ${descriptor.kind}: ${key} → ${descriptor.handlerClass.name}`);
        }
    }
}
