import type { BaseMetadata } from "./BaseMetadata.js";

export interface RoleSelectMetadata extends BaseMetadata {
    customId: string;
    componentType: 'ROLE_SELECT';
}
