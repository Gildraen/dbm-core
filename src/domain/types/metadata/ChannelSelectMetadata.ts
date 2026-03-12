import type { BaseMetadata } from "./BaseMetadata.js";

export interface ChannelSelectMetadata extends BaseMetadata {
    customId: string;
    componentType: 'CHANNEL_SELECT';
}
