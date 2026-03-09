import type { SelectInteraction } from "app/domain/interface/platform/interactions/SelectInteraction.js";

export interface UserSelectListener {
    customId: string;
    handle(interaction: SelectInteraction): Promise<unknown>;
}
