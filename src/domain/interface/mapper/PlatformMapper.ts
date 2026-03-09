import type { PlatformTextMessage } from "app/domain/interface/events/PlatformTextMessage.js";
import type { PlatformGuildMember } from "app/domain/interface/events/PlatformGuildMember.js";
import type { PlatformTextChannel } from "app/domain/interface/events/PlatformTextChannel.js";
import type { Client } from "app/domain/interface/platform/Client.js";

export interface BiMapper<Infra, Platform> {
    toPlatform(input: Infra): Platform;
    fromPlatform(input: Platform): Infra;
}

export interface PlatformModelMappers<
    ClientInfra,
    MessageInfra,
    GuildMemberInfra,
    TextChannelInfra
> {
    client: BiMapper<ClientInfra, Client>;
    message: BiMapper<MessageInfra, PlatformTextMessage>;
    member: BiMapper<GuildMemberInfra, PlatformGuildMember>;
    textChannel: BiMapper<TextChannelInfra, PlatformTextChannel>;
}