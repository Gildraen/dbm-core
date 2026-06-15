import type { RegistryInterface } from "app/domain/interface/registry/RegistryInterface.js";
import type { DescriptorInterface } from "app/domain/interface/registry/DescriptorInterface.js";
import type { Kind, RegistryKey } from "app/domain/interface/registry/types.js";

export class Registry implements RegistryInterface {
    private readonly descriptors = new Map<RegistryKey, DescriptorInterface>();

    upsert(descriptor: DescriptorInterface): void {
        if (this.descriptors.has(descriptor.key)) {
            console.warn(`⚠️  Overwriting registration for key: ${descriptor.key}`);
        }
        this.descriptors.set(descriptor.key, descriptor);
        console.log(`✅ Registered ${descriptor.kind}: ${descriptor.key}`);
    }

    remove(key: RegistryKey): boolean {
        const existed = this.descriptors.has(key);
        if (existed) {
            this.descriptors.delete(key);
        }
        return existed;
    }

    clear(kind?: Kind): void {
        if (kind) {
            for (const [key, descriptor] of this.descriptors.entries()) {
                if (descriptor.kind === kind) {
                    this.descriptors.delete(key);
                }
            }
        } else {
            this.descriptors.clear();
        }
    }

    get(key: RegistryKey): DescriptorInterface | undefined {
        return this.descriptors.get(key);
    }

    list(kind?: Kind): ReadonlyArray<DescriptorInterface> {
        const all = Array.from(this.descriptors.values());
        return kind ? all.filter(d => d.kind === kind) : all;
    }

    has(key: RegistryKey): boolean {
        return this.descriptors.has(key);
    }

    size(kind?: Kind): number {
        return kind ? this.list(kind).length : this.descriptors.size;
    }
}
