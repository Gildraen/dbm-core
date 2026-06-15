import type { RegistryInterface } from "app/domain/interface/registry/RegistryInterface.js";
import type { DescriptorInterface } from "app/domain/interface/registry/DescriptorInterface.js";

export class Registry implements RegistryInterface {
    private readonly descriptors = new Map<string, DescriptorInterface>();

    upsert(descriptor: DescriptorInterface): void {
        if (this.descriptors.has(descriptor.key)) {
            console.warn(`⚠️  Overwriting registration for key: ${descriptor.key}`);
        }
        this.descriptors.set(descriptor.key, descriptor);
        console.log(`✅ Registered ${descriptor.kind}: ${descriptor.key}`);
    }

    remove(key: string): boolean {
        const existed = this.descriptors.has(key);
        if (existed) {
            this.descriptors.delete(key);
        }
        return existed;
    }

    clear(kind?: string): void {
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

    get(key: string): DescriptorInterface | undefined {
        return this.descriptors.get(key);
    }

    list(kind?: string): ReadonlyArray<DescriptorInterface> {
        const all = Array.from(this.descriptors.values());
        return kind ? all.filter(d => d.kind === kind) : all;
    }

    has(key: string): boolean {
        return this.descriptors.has(key);
    }

    size(kind?: string): number {
        return kind ? this.list(kind).length : this.descriptors.size;
    }
}
