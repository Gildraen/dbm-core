import { z } from "zod";

export const configSchema = z.object({
    modules: z.array(
        z.object({
            name: z.string().min(1, "Module name is required"),
            enabled: z.boolean().default(false),
            settings: z.record(z.any()).optional(),
        })
    ),
});

export type ConfigType = z.infer<typeof configSchema>;
