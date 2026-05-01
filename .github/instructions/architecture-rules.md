## Platform Layer Rule

The platform layer must never mirror a specific platform API (Discord, Slack, etc.).

Do not introduce types such as:

- PlatformGuild
- PlatformChannel
- PlatformSlashCommand
- PlatformInteraction

External platforms must be translated by adapters into the core execution primitives (invocation, handler, capability).
