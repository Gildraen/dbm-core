# Command Registration Workflow (CLI)

## Overview

This diagram shows the complete flow from CLI execution to Discord API command registration.

## Full Command Registration Flow

```mermaid
sequenceDiagram
    participant CLI as register-commands CLI
    participant Bootstrap as Bootstrap/Init
    participant Provider as RegistryProvider
    participant UseCase as RegisterCommands
    participant Loader as ModuleLoader
    participant Module as Module (External)
    participant Decorator as Decorators
    participant Registry as Registry Instance
    participant Service as CommandRegistrationService
    participant Repo as DiscordCommandRepository
    participant Discord as Discord API

    CLI->>CLI: Parse CLI arguments
    CLI->>Bootstrap: Initialize system

    Bootstrap->>Provider: configure(registry)
    Provider-->>Bootstrap: ✅ Configured

    CLI->>Repo: new DiscordCommandRepository(client)
    CLI->>Provider: getRegistry()
    Provider-->>CLI: registry instance

    CLI->>UseCase: new RegisterCommands(repo, registry)
    CLI->>UseCase: execute()

    UseCase->>UseCase: config.getEnabledModules()

    loop For each enabled module
        UseCase->>Loader: loadModule(moduleName)
        Loader->>Module: import(moduleName)
        Module-->>Loader: module object

        UseCase->>Module: discoverCommands()

        Note over Module,Decorator: Module imports decorated class files
        Module->>Module: import './commands/PingCommand.js'
        Module->>Decorator: Decorator executes
        Decorator->>Registry: upsert({ key, kind, metadata, handler })
        Registry-->>Decorator: ✅ Stored

        Module-->>UseCase: Discovery complete
    end

    UseCase->>Service: registerDiscoveredCommands()

    Service->>Service: buildCommandsFromRegistry()
    Service->>Registry: list(REGISTRY_KINDS.SLASH)
    Registry-->>Service: SlashCommand descriptors[]

    Service->>Registry: list(REGISTRY_KINDS.CONTEXT_USER)
    Registry-->>Service: UserContextMenu descriptors[]

    Service->>Registry: list(REGISTRY_KINDS.CONTEXT_MESSAGE)
    Registry-->>Service: MessageContextMenu descriptors[]

    loop For each descriptor
        Service->>Service: buildCommand(descriptor)
        Service->>Service: new HandlerClass()
        Service->>Service: handler.buildCommand()
        Note over Service: Creates PlatformCommand object
    end

    Service->>Repo: registerCommands(commands[])

    Repo->>Repo: Adapt to Discord format
    loop For each command
        Repo->>Repo: adaptToDiscordCommand()
    end

    Repo->>Discord: client.application.commands.set()
    Discord-->>Repo: Registered commands

    Repo-->>Service: Count of registered
    Service-->>UseCase: Success + count
    UseCase-->>CLI: ✅ Complete

    CLI->>CLI: Log success & cleanup
```

## Command Discovery Phase (Detailed)

```mermaid
flowchart TD
    Start[CLI: execute] --> GetModules[Get enabled modules<br/>from config]

    GetModules --> Loop{For each module}

    Loop -->|Next module| LoadMod[ModuleLoader.loadModule]
    LoadMod --> Import[Dynamic import module]
    Import --> Validate{Valid<br/>ModuleInterface?}

    Validate -->|No| Error1[❌ Error: Invalid module]
    Validate -->|Yes| HasDiscover{Has<br/>discoverCommands?}

    HasDiscover -->|No| Loop
    HasDiscover -->|Yes| CallDiscover[await module.discoverCommands]

    CallDiscover --> ModuleImports[Module imports command files]
    ModuleImports --> DecExec[Decorators execute on import]
    DecExec --> RegPop[Registry populated with handlers]
    RegPop --> Loop

    Loop -->|Done| BuildPhase[Build commands from registry]

    BuildPhase --> QueryReg[Query registry for all command kinds]
    QueryReg --> GetDescriptors[Get descriptors for:<br/>- SLASH<br/>- CONTEXT_USER<br/>- CONTEXT_MESSAGE]

    GetDescriptors --> BuildLoop{For each descriptor}
    BuildLoop --> Instantiate[Instantiate handler class]
    Instantiate --> CallBuild[Call handler.buildCommand]
    CallBuild --> PlatformCmd[Create PlatformCommand object]
    PlatformCmd --> BuildLoop

    BuildLoop -->|Done| SendDiscord[Send to Discord API]
    SendDiscord --> Success[✅ Commands registered]

    Error1 --> End[Log error & continue]
    Success --> End

    style Start fill:#e1f5ff
    style RegPop fill:#c8e6c9
    style Success fill:#c8e6c9
    style Error1 fill:#ffcdd2
```

## Module Discovery Contract

```mermaid
classDiagram
    class ModuleInterface {
        <<interface>>
        +string name
        +discoverCommands?() Promise~unknown~
        +discoverListeners?() Promise~unknown~
        +migrate?(context) Promise~unknown~
    }

    class ExampleModule {
        +string name
        +discoverCommands() Promise~void~
        +discoverListeners() Promise~void~
    }

    class PingCommand {
        <<@SlashCommand>>
        +string name
        +handle(interaction) Promise~void~
        +buildCommand() PlatformCommand
    }

    class HelpCommand {
        <<@SlashCommand>>
        +string name
        +handle(interaction) Promise~void~
        +buildCommand() PlatformCommand
    }

    ModuleInterface <|.. ExampleModule : implements
    ExampleModule ..> PingCommand : imports during discovery
    ExampleModule ..> HelpCommand : imports during discovery

    note for ExampleModule "discoverCommands() dynamically imports\nall command files, triggering decorators"
```

## Command Building Process

```mermaid
flowchart LR
    subgraph Registry["Registry State"]
        Desc1[Descriptor 1<br/>SlashCommand]
        Desc2[Descriptor 2<br/>UserContextMenu]
        Desc3[Descriptor 3<br/>MessageContextMenu]
    end

    subgraph Service["CommandRegistrationService"]
        direction TB
        List[List all command kinds]
        Build[Build each command]
        Collect[Collect PlatformCommands]
    end

    subgraph Transform["Handler → Platform"]
        direction TB
        Inst[Instantiate Handler]
        Call[Call buildCommand]
        Platform[PlatformCommand object]
    end

    subgraph Repository["DiscordCommandRepository"]
        direction TB
        Adapt[Adapt to Discord format]
        Send[Send to Discord API]
        Result[Return count]
    end

    Registry --> List
    List --> Build
    Build --> Transform
    Transform --> Collect
    Collect --> Adapt
    Adapt --> Send
    Send --> Result

    style Registry fill:#e3f2fd
    style Transform fill:#fff9c4
    style Result fill:#c8e6c9
```

## PlatformCommand Structure

```mermaid
graph TB
    subgraph Platform["PlatformCommand Types"]
        direction TB

        Base[PlatformCommand<br/>Union Type]

        Slash["PlatformSlashCommand<br/>type: \"slash\"<br/>name: string<br/>description: string<br/>options: CommandOption array"]

        UserCtx["PlatformUserContextCommand<br/>type: \"context:user\"<br/>name: string"]

        MsgCtx["PlatformMessageContextCommand<br/>type: \"context:message\"<br/>name: string"]

        Base --> Slash
        Base --> UserCtx
        Base --> MsgCtx
    end

    subgraph Discord["Discord API Format"]
        direction TB

        DiscordCmd[RESTPostAPIApplicationCommandsJSONBody]

        DiscordSlash["type: 1 ChatInput<br/>name: string<br/>description: string<br/>options: array"]

        DiscordUserCtx["type: 2 User<br/>name: string"]

        DiscordMsgCtx["type: 3 Message<br/>name: string"]

        DiscordCmd --> DiscordSlash
        DiscordCmd --> DiscordUserCtx
        DiscordCmd --> DiscordMsgCtx
    end

    Slash -.->|Adapt| DiscordSlash
    UserCtx -.->|Adapt| DiscordUserCtx
    MsgCtx -.->|Adapt| DiscordMsgCtx

    style Platform fill:#e3f2fd
    style Discord fill:#c8e6c9
```

## CLI Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Startup: CLI invoked

    Startup --> ParseArgs: Parse arguments
    ParseArgs --> CheckHelp: Check --help flag

    CheckHelp --> ShowHelp: Help requested
    CheckHelp --> CheckToken: No help flag

    ShowHelp --> [*]: Exit 0

    CheckToken --> TokenMissing: No DISCORD_TOKEN
    CheckToken --> InitDiscord: Token present

    TokenMissing --> [*]: Exit 1 (Error)

    InitDiscord --> LoginDiscord: Create & login client
    LoginDiscord --> InitRegistry: Initialize registry
    InitRegistry --> ExecuteUseCase: Run RegisterCommands

    ExecuteUseCase --> Discovery: Module discovery
    Discovery --> Building: Build commands
    Building --> Registration: Register with Discord

    Registration --> Success: All registered
    Registration --> PartialSuccess: Some failed
    Registration --> Failed: All failed

    Success --> SaveReport: Save report (if --output)
    PartialSuccess --> SaveReport
    Failed --> SaveReport

    SaveReport --> Cleanup: Destroy Discord client
    Cleanup --> [*]: Exit

    note right of InitRegistry
        CRITICAL: Must happen
        before module discovery
    end note

    note right of Discovery
        Decorators execute
        during import
    end note
```

## Error Handling

```mermaid
flowchart TD
    Start[Command Registration] --> Try1{Try: Module Loading}

    Try1 -->|Error| Catch1[Catch & Log Error]
    Catch1 --> Continue1[Continue to next module]
    Try1 -->|Success| Try2{Try: Discovery}

    Try2 -->|Error| Catch2[Catch & Log Error]
    Catch2 --> Continue1
    Try2 -->|Success| Continue1

    Continue1 --> AllModules{More modules?}
    AllModules -->|Yes| Try1
    AllModules -->|No| Try3{Try: Registration}

    Try3 -->|Error| Catch3[Catch & Log Error]
    Catch3 --> Fail[Registration Failed]
    Try3 -->|Success| Success[✅ Success]

    Fail --> Report[Generate Report]
    Success --> Report
    Report --> End[CLI Exit]

    style Success fill:#c8e6c9
    style Fail fill:#ffcdd2
    style Catch1 fill:#fff9c4
    style Catch2 fill:#fff9c4
    style Catch3 fill:#fff9c4
```

## Key Points

### 🎯 Critical Success Factors

1. ✅ **Registry initialized before module discovery**
2. ✅ **Modules implement `discoverCommands()` correctly**
3. ✅ **Decorators execute during imports**
4. ✅ **All handlers implement `buildCommand()`**
5. ✅ **Discord client authenticated**

### ⚠️ Common Failure Points

1. ❌ Registry not configured → Decorator crashes
2. ❌ Module doesn't import command files → Nothing registered
3. ❌ Handler missing `buildCommand()` → Build phase fails
4. ❌ Invalid Discord token → API call fails
5. ❌ Invalid command structure → Discord API rejects

### 📊 Success Metrics

- **Discovery**: Number of modules processed
- **Registry**: Number of handlers registered
- **Building**: Number of platform commands built
- **Registration**: Number of commands registered with Discord
- **Comparison**: Built vs Registered (should match)
