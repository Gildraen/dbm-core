import { z } from "zod";

export const ModuleConfigSchema = z.object({
    enabled: z.boolean(),
    settings: z.record(z.unknown()),
}).strict();

export const CoreConfigSchema = z.object({}).default({});

export const ConfigSchema = z.object({
    core: CoreConfigSchema,
    modules: z.record(ModuleConfigSchema),
});

export type ModuleConfigType = z.infer<typeof ModuleConfigSchema>;
export type CoreConfigType = z.infer<typeof CoreConfigSchema>;
export type ConfigType = z.infer<typeof ConfigSchema>;
