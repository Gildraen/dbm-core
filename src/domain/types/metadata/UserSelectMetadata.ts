import type { BaseMetadata } from "./BaseMetadata.js";

export interface UserSelectMetadata extends BaseMetadata {
    customId: string;
    componentType: 'USER_SELECT';
}
