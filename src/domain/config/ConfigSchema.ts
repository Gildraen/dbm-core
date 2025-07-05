import { z } from "zod";

export const ModuleConfigSchema = z.object({
    enabled: z.boolean(),
    settings: z.record(z.unknown()), // settings obligatoires mais libres
}).strict();

export const ConfigSchema = z.record(ModuleConfigSchema);

export type ConfigType = z.infer<typeof ConfigSchema>;
export type ModuleConfigType = z.infer<typeof ModuleConfigSchema>;
