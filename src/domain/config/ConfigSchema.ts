import { z } from "zod";

/**
 * Registry type constants for better type safety and management
 */
export const RegistryType = {
    IN_MEMORY: 'in-memory',
    DISCORD: 'discord',
} as const;

export type RegistryType = typeof RegistryType[keyof typeof RegistryType];

export const ModuleConfigSchema = z.object({
    enabled: z.boolean(),
    settings: z.record(z.unknown()), // settings obligatoires mais libres
}).strict();

export const RegistryConfigSchema = z.object({
    type: z.enum([RegistryType.IN_MEMORY, RegistryType.DISCORD]).default(RegistryType.IN_MEMORY),
    options: z.object({
        filePath: z.string().optional(),
        connectionString: z.string().optional(),
    }).optional(),
}).default({ type: RegistryType.IN_MEMORY });

export const CoreConfigSchema = z.object({
    registry: RegistryConfigSchema,
}).default({ registry: { type: RegistryType.IN_MEMORY } });

export const ConfigSchema = z.object({
    core: CoreConfigSchema,
    modules: z.record(ModuleConfigSchema),
});

export type ModuleConfigType = z.infer<typeof ModuleConfigSchema>;
export type RegistryConfigType = z.infer<typeof RegistryConfigSchema>;
export type CoreConfigType = z.infer<typeof CoreConfigSchema>;
export type ConfigType = z.infer<typeof ConfigSchema>;
