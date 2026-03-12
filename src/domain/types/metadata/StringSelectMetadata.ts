import type { BaseMetadata } from "./BaseMetadata.js";

export interface StringSelectMetadata extends BaseMetadata {
    customId: string;
    componentType: 'STRING_SELECT';
}
