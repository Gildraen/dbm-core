# Listener Registration Workflow

## Overview

This diagram shows how event listeners and interaction handlers are discovered and registered with Discord.js client.

## Full Listener Registration Flow

```mermaid
sequenceDiagram
    participant App as Application/Bot
    participant UseCase as RegisterListeners
    participant Loader as ModuleLoader
    participant Module as Module
    participant Decorator as Decorators
    participant Registry as Registry
    participant Service as ListenerRegistrationService
    participant Repo as DiscordListenerRepository
    participant Client as Discord.js Client

    App->>UseCase: new RegisterListeners(repo, registry)
    App->>UseCase: execute()

    UseCase->>UseCase: config.getEnabledModules()

    loop For each enabled module
        UseCase->>Loader: loadModule(moduleName)
        Loader->>Module: import(moduleName)
        Module-->>Loader: module object

        UseCase->>Module: discoverListeners()

        Note over Module,Decorator: Module imports listener files
        Module->>Module: import './listeners/MessageLogger.js'
        Module->>Decorator: @Event decorator executes
        Decorator->>Registry: upsert({ key, kind, metadata, handler })
        Registry-->>Decorator: ✅ Stored

        Module->>Module: import './components/RoleSelector.js'
        Module->>Decorator: @StringSelect decorator executes
        Decorator->>Registry: upsert({ key, kind, metadata, handler })
        Registry-->>Decorator: ✅ Stored

        Module-->>UseCase: Discovery complete
    end

    UseCase->>Service: registerDiscoveredListeners()

    Service->>Service: setupEventListeners()
    Service->>Registry: list(REGISTRY_KINDS.EVENT)
    Registry-->>Service: Event descriptors[]

    loop For each event descriptor
        Service->>Service: new HandlerClass()
        Service->>Repo: registerEventListener(handler, metadata)
        Repo->>Client: client.on(eventName, callback)
        Client-->>Repo: ✅ Listener attached
    end

    Service->>Service: setupInteractionListeners()
    Service->>Registry: list(REGISTRY_KINDS.AUTOCOMPLETE)
    Service->>Registry: list(REGISTRY_KINDS.STRING_SELECT)
    Service->>Registry: list(REGISTRY_KINDS.USER_SELECT)
    Service->>Registry: list(REGISTRY_KINDS.ROLE_SELECT)
    Service->>Registry: list(REGISTRY_KINDS.CHANNEL_SELECT)
    Service->>Registry: list(REGISTRY_KINDS.MENTIONABLE_SELECT)

    Service->>Repo: registerInteractionListeners(handlers)
    Repo->>Client: client.on('interactionCreate', router)
    Client-->>Repo: ✅ Router attached

    Service-->>UseCase: Total count
    UseCase-->>App: ✅ Complete
```

## Listener Discovery Phase

```mermaid
flowchart TD
    Start[RegisterListeners.execute] --> GetModules[Get enabled modules]

    GetModules --> Loop{For each module}

    Loop -->|Next| LoadMod[Load module]
    LoadMod --> HasDiscover{Has<br/>discoverListeners?}

    HasDiscover -->|No| Loop
    HasDiscover -->|Yes| CallDiscover[await module.discoverListeners]

    CallDiscover --> ImportFiles[Import listener files]

    ImportFiles --> DecType{Decorator Type?}

    DecType -->|"Event"| EventDec["Event decorator"]
    DecType -->|"Autocomplete"| AutoDec["Autocomplete decorator"]
    DecType -->|"StringSelect"| StringDec["StringSelect decorator"]
    DecType -->|"UserSelect"| UserDec["UserSelect decorator"]
    DecType -->|"RoleSelect"| RoleDec["RoleSelect decorator"]
    DecType -->|"ChannelSelect"| ChannelDec["ChannelSelect decorator"]
    DecType -->|"MentionableSelect"| MentionDec["MentionableSelect decorator"]

    EventDec --> Register[Register in registry]
    AutoDec --> Register
    StringDec --> Register
    UserDec --> Register
    RoleDec --> Register
    ChannelDec --> Register
    MentionDec --> Register

    Register --> Loop

    Loop -->|Done| SetupPhase[Setup listeners phase]

    SetupPhase --> SetupEvents[Setup event listeners]
    SetupPhase --> SetupInteractions[Setup interaction router]

    SetupEvents --> Success[✅ All listeners registered]
    SetupInteractions --> Success

    style Register fill:#c8e6c9
    style Success fill:#c8e6c9
```

## Event Listener Setup

```mermaid
flowchart LR
    subgraph Registry["Registry Query"]
        QueryEvents[List all EVENT kinds]
        EventDesc[Event Descriptors]
    end

    subgraph Processing["Event Processing"]
        direction TB
        Loop[For each descriptor]
        Inst[Instantiate handler]
        Extract[Extract metadata]
        Attach[Attach to client]
    end

    subgraph Client["Discord.js Client"]
        direction TB
        MessageCreate[client.on<br/>'messageCreate']
        Ready[client.on<br/>'ready']
        GuildCreate[client.on<br/>'guildCreate']
        Custom[client.on<br/>'customEvent']
    end

    QueryEvents --> EventDesc
    EventDesc --> Loop
    Loop --> Inst
    Inst --> Extract
    Extract --> Attach

    Attach -.->|eventName| MessageCreate
    Attach -.->|eventName| Ready
    Attach -.->|eventName| GuildCreate
    Attach -.->|eventName| Custom

    style Registry fill:#e3f2fd
    style Processing fill:#fff9c4
    style Client fill:#c8e6c9
```

## Interaction Listener Router

```mermaid
flowchart TD
    Start[Discord.js Event:<br/>interactionCreate] --> Check{Interaction Type?}

    Check -->|isAutocomplete| FindAuto[Find autocomplete handler]
    Check -->|isStringSelectMenu| FindString[Find string select handler]
    Check -->|isUserSelectMenu| FindUser[Find user select handler]
    Check -->|isRoleSelectMenu| FindRole[Find role select handler]
    Check -->|isChannelSelectMenu| FindChannel[Find channel select handler]
    Check -->|isMentionableSelectMenu| FindMention[Find mentionable select handler]
    Check -->|Other| Ignore[Ignore - not handled]

    FindAuto --> LookupAuto[Lookup by customId/commandName]
    FindString --> LookupComp[Lookup by customId]
    FindUser --> LookupComp
    FindRole --> LookupComp
    FindChannel --> LookupComp
    FindMention --> LookupComp

    LookupAuto --> Found{Handler found?}
    LookupComp --> Found

    Found -->|Yes| Execute[Execute handler.handle]
    Found -->|No| NotFound[Log: Handler not found]

    Execute --> Success[✅ Handled]
    NotFound --> End[End]
    Success --> End
    Ignore --> End

    style Success fill:#c8e6c9
    style NotFound fill:#fff9c4
    style Ignore fill:#e0e0e0
```

## Listener Types & Registration

```mermaid
graph TB
    subgraph EventListeners["Event Listeners"]
        direction LR
        Event1["Event messageCreate"]
        Event2["Event ready"]
        Event3["Event guildMemberAdd"]

        Event1 --> Direct1[Direct client.on attachment]
        Event2 --> Direct2[Direct client.on attachment]
        Event3 --> Direct3[Direct client.on attachment]
    end

    subgraph InteractionListeners["Interaction Listeners"]
        direction TB

        subgraph Autocomplete["Autocomplete"]
            Auto["Autocomplete music"]
        end

        subgraph SelectMenus["Select Menus"]
            String["StringSelect role-select"]
            User["UserSelect user-picker"]
            Role["RoleSelect role-filter"]
            Channel["ChannelSelect channel-picker"]
            Mention["MentionableSelect mention-picker"]
        end

        Autocomplete --> Router[Interaction Router<br/>client.on 'interactionCreate']
        SelectMenus --> Router
    end

    style EventListeners fill:#e3f2fd
    style InteractionListeners fill:#fff3e0
    style Router fill:#c8e6c9
```

## Handler Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Defined: Class with decorator

    Defined --> Imported: Module discovery imports file
    Imported --> Decorated: Decorator executes
    Decorated --> Registered: Stored in registry

    Registered --> Queried: ListenerRegistrationService queries
    Queried --> Instantiated: new HandlerClass()
    Instantiated --> Attached: Attached to Discord client

    Attached --> Listening: Waiting for events

    Listening --> Triggered: Event/Interaction occurs
    Triggered --> Executing: handler.handle() called
    Executing --> Listening: Waiting for next event

    state Attached {
        [*] --> EventListener: Event listeners
        [*] --> InteractionRouter: Interaction handlers
    }

    note right of Decorated
        Happens at import time
        NOT at instantiation
    end note

    note right of Listening
        Handler instance remains
        in memory, reused for
        multiple invocations
    end note
```

## Component Handler Routing

```mermaid
sequenceDiagram
    participant Discord as Discord API
    participant Client as Discord.js Client
    participant Router as Interaction Router
    participant Handlers as Handler Map
    participant Handler as Handler Instance
    participant App as Application Logic

    Discord->>Client: Interaction event
    Client->>Router: interactionCreate event

    Router->>Router: Check interaction type

    alt isStringSelectMenu
        Router->>Router: Extract customId
        Router->>Handlers: Get handler for customId
        Handlers-->>Router: StringSelectHandler
    else isAutocomplete
        Router->>Router: Extract command name
        Router->>Handlers: Get autocomplete handler
        Handlers-->>Router: AutocompleteHandler
    else Other component type
        Router->>Router: Extract customId
        Router->>Handlers: Get handler for customId
        Handlers-->>Router: Component handler
    end

    alt Handler found
        Router->>Handler: handle(interaction)
        Handler->>App: Execute business logic
        App-->>Handler: Result
        Handler->>Discord: Respond to interaction
        Discord-->>Client: Response sent
    else Handler not found
        Router->>Router: Log warning
        Note over Router: Handler not registered for customId
    end
```

## Registry Organization for Listeners

```mermaid
graph TB
    subgraph Registry["Registry Storage"]
        direction TB

        subgraph Events["EVENT Kind"]
            E1["Key: event:messageCreate<br/>Handler: MessageLogger"]
            E2["Key: event:ready<br/>Handler: ReadyHandler"]
            E3["Key: event:guildMemberAdd<br/>Handler: WelcomeHandler"]
        end

        subgraph Autocomplete["AUTOCOMPLETE Kind"]
            A1["Key: autocomplete:slash:music<br/>Handler: MusicAutocomplete"]
            A2["Key: autocomplete:slash:search<br/>Handler: SearchAutocomplete"]
        end

        subgraph SelectMenus["Component Kinds"]
            S1["Key: component:role-selector<br/>Kind: STRING_SELECT<br/>Handler: RoleSelector"]
            S2["Key: component:user-picker<br/>Kind: USER_SELECT<br/>Handler: UserPicker"]
            S3["Key: component:role-filter<br/>Kind: ROLE_SELECT<br/>Handler: RoleFilter"]
        end
    end

    Events -.->|List by KIND| Service[ListenerRegistrationService]
    Autocomplete -.->|List by KIND| Service
    SelectMenus -.->|List by KIND| Service

    Service --> Setup[Setup & Attach]

    style Events fill:#e3f2fd
    style Autocomplete fill:#f3e5f5
    style SelectMenus fill:#fff3e0
    style Setup fill:#c8e6c9
```

## Key Differences: Commands vs Listeners

```mermaid
graph LR
    subgraph Commands["Commands (One-time)"]
        direction TB
        CmdReg[Registration Phase]
        CmdBuild[Build all at once]
        CmdSend[Send to Discord API]
        CmdDone[✅ Done until restart]

        CmdReg --> CmdBuild
        CmdBuild --> CmdSend
        CmdSend --> CmdDone
    end

    subgraph Listeners["Listeners (Persistent)"]
        direction TB
        ListReg[Registration Phase]
        ListAttach[Attach to client]
        ListWait[Wait for events]
        ListHandle[Handle event]
        ListRepeat[Repeat forever]

        ListReg --> ListAttach
        ListAttach --> ListWait
        ListWait --> ListHandle
        ListHandle --> ListWait
    end

    style CmdDone fill:#c8e6c9
    style ListRepeat fill:#fff9c4
```

## Error Handling in Listener Registration

```mermaid
flowchart TD
    Start[Register Listeners] --> TrySetup{Try: Setup Events}

    TrySetup -->|Error| CatchSetup[Catch & Log]
    CatchSetup --> ContinueSetup[Continue with next]
    TrySetup -->|Success| Attached[Event attached]

    Attached --> ContinueSetup
    ContinueSetup --> MoreEvents{More events?}

    MoreEvents -->|Yes| TrySetup
    MoreEvents -->|No| TryRouter{Try: Setup Router}

    TryRouter -->|Error| CatchRouter[Catch & Log]
    CatchRouter --> Fail[Partial failure]
    TryRouter -->|Success| RouterAttached[Router attached]

    RouterAttached --> Success[✅ All listeners registered]

    Fail --> Report[Return partial count]
    Success --> Report
    Report --> End[Complete]

    style Success fill:#c8e6c9
    style Fail fill:#ffcdd2
    style CatchSetup fill:#fff9c4
    style CatchRouter fill:#fff9c4
```

## Critical Notes

### 🎯 Key Concepts

1. **Event Listeners**: Direct attachment to Discord.js client events
2. **Interaction Router**: Single handler that routes component interactions
3. **Handler Instances**: Created once, reused for all invocations
4. **Custom ID Mapping**: Components identified by their customId
5. **Type Safety**: Each interaction type has specific handler interface

### ⚠️ Common Issues

1. ❌ CustomId mismatch → Handler not found
2. ❌ Missing `discoverListeners()` → Handlers not imported
3. ❌ Handler not instantiated → Can't call handle method
4. ❌ Wrong interaction type → Router can't match
5. ❌ Event name typo → Listener never triggered

### 📊 Success Indicators

- **Discovery**: All listener files imported
- **Registry**: All handlers stored with correct kinds
- **Attachment**: All event listeners attached to client
- **Router**: Interaction router attached and functioning
- **Execution**: Handlers responding to events/interactions
