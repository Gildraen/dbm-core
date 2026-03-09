import type { BaseMetadata } from "./BaseMetadata.js";

export interface MentionableSelectMetadata extends BaseMetadata {
    customId: string;
    componentType: 'MENTIONABLE_SELECT';
}
