# Decorator Registration Workflow

## Overview

This diagram shows how decorators register handlers in the registry when TypeScript classes are imported.

## Decorator Execution Flow

```mermaid
sequenceDiagram
    participant Module as Module Import
    participant TS as TypeScript Runtime
    participant Decorator as @SlashCommand Decorator
    participant Provider as RegistryProvider
    participant Registry as Registry Instance
    participant Keys as Keys Helper

    Module->>TS: import './PingCommand.js'
    TS->>TS: Parse class definition
    TS->>Decorator: Execute decorator function

    Note over Decorator: @SlashCommand('ping', 'Replies with pong!')

    Decorator->>Decorator: Create metadata object
    Note over Decorator: metadata: SlashCommandMetadata = {<br/>  name: 'PingCommand',<br/>  description: 'Replies with pong!'<br/>}

    Decorator->>Provider: getRegistry()
    Provider->>Provider: Check if configured

    alt Registry configured
        Provider-->>Decorator: PlatformRegistryInterface
    else Not configured
        Provider-->>Decorator: ❌ throw Error
        Note over Decorator,Provider: "Registry not configured"
    end

    Decorator->>Keys: Keys.slash('ping')
    Keys-->>Decorator: 'slash:ping'

    Decorator->>Registry: upsert({ key, kind, metadata, handlerClass })
    Registry->>Registry: Store in Map
    Registry-->>Decorator: ✅ Stored

    Decorator-->>TS: Return decorated class
    TS-->>Module: Class ready for use

    Note over Module,Registry: Handler now discoverable via registry.list()
```

## All Decorator Types Flow

```mermaid
flowchart TD
    Start[Class with Decorator<br/>is imported] --> Parse[TypeScript parses class]

    Parse --> DecType{Decorator Type?}

    DecType -->|"SlashCommand"| SlashDec["SlashCommand<br/>Creates SlashCommandMetadata"]
    DecType -->|"Event"| EventDec["Event<br/>Creates EventListenerMetadata"]
    DecType -->|"UserContextMenu"| UserCtxDec["UserContextMenu<br/>Creates UserContextMenuMetadata"]
    DecType -->|"MessageContextMenu"| MsgCtxDec["MessageContextMenu<br/>Creates MessageContextMenuMetadata"]
    DecType -->|"Autocomplete"| AutoDec["Autocomplete<br/>Creates AutocompleteListenerMetadata"]
    DecType -->|"Component Select"| ComponentDec["StringSelect/UserSelect/etc<br/>Creates Component Metadata"]

    SlashDec --> CreateMeta[Create typed metadata object]
    EventDec --> CreateMeta
    UserCtxDec --> CreateMeta
    MsgCtxDec --> CreateMeta
    AutoDec --> CreateMeta
    ComponentDec --> CreateMeta

    CreateMeta --> GetProvider[registryProvider.getRegistry]
    GetProvider --> CheckConfig{Provider<br/>configured?}

    CheckConfig -->|"No"| Error["Throw Error<br/>Registry not configured"]
    CheckConfig -->|Yes| GetRegistry[Get registry instance]

    GetRegistry --> CreateKey["Create registry key<br/>Keys slash event component etc"]
    CreateKey --> Upsert["registry.upsert<br/>Store descriptor"]
    Upsert --> Store["Registry Map Storage"]
    Store --> Success["Handler Registered"]

    Error --> End[Decorator fails]
    Success --> End[Decorator returns class]

    style Start fill:#e1f5ff
    style CreateMeta fill:#fff9c4
    style Store fill:#c8e6c9
    style Success fill:#c8e6c9
    style Error fill:#ffcdd2
```

## Registry Storage Structure

```mermaid
graph TB
    subgraph Registry["Registry (Map Storage)"]
        direction TB

        subgraph Commands["Commands"]
            Slash1[Key: 'slash:ping'<br/>Kind: SLASH<br/>Metadata: SlashCommandMetadata<br/>Handler: PingCommand]
            Slash2[Key: 'slash:help'<br/>Kind: SLASH<br/>Metadata: SlashCommandMetadata<br/>Handler: HelpCommand]
            UserCtx[Key: 'context:user:userinfo'<br/>Kind: CONTEXT_USER<br/>Metadata: UserContextMenuMetadata<br/>Handler: UserInfoCommand]
            MsgCtx[Key: 'context:message:report'<br/>Kind: CONTEXT_MESSAGE<br/>Metadata: MessageContextMenuMetadata<br/>Handler: ReportCommand]
        end

        subgraph Listeners["Listeners"]
            Event1[Key: 'evt:messageCreate'<br/>Kind: EVENT<br/>Metadata: EventListenerMetadata<br/>Handler: MessageLogger]
            Event2[Key: 'evt:ready'<br/>Kind: EVENT<br/>Metadata: EventListenerMetadata<br/>Handler: ReadyHandler]
            Auto[Key: 'ac:slash:music'<br/>Kind: AUTOCOMPLETE<br/>Metadata: AutocompleteListenerMetadata<br/>Handler: MusicAutocomplete]
        end

        subgraph Components["Components"]
            String[Key: 'cmp:role-selector'<br/>Kind: STRING_SELECT<br/>Metadata: StringSelectMetadata<br/>Handler: RoleSelector]
            User[Key: 'cmp:user-picker'<br/>Kind: USER_SELECT<br/>Metadata: UserSelectMetadata<br/>Handler: UserPicker]
        end
    end

    style Commands fill:#e3f2fd
    style Listeners fill:#f3e5f5
    style Components fill:#fff3e0
```

## Metadata Type Safety

```mermaid
flowchart LR
    subgraph TypeSystem["Type-Safe Metadata System"]
        direction TB

        Kind[REGISTRY_KINDS<br/>const object]
        KindMap[KindMetadataMap<br/>Discriminated Union]
        Descriptor[DescriptorInterface&lt;K&gt;<br/>Generic Interface]

        Kind -.->|Maps to| KindMap
        KindMap -.->|Used by| Descriptor
    end

    subgraph Examples["Example Mappings"]
        direction TB

        Ex1["SLASH → SlashCommandMetadata"]
        Ex2["EVENT → EventListenerMetadata"]
        Ex3["STRING_SELECT → StringSelectMetadata"]
        Ex4["USER_SELECT → UserSelectMetadata"]
    end

    TypeSystem --> Examples

    style TypeSystem fill:#c8e6c9
    style Examples fill:#fff9c4
```

## Critical Points

### ⚠️ Timing is Critical

```mermaid
timeline
    title Correct vs Incorrect Initialization Order

    section ✅ CORRECT
        Bootstrap : Initialize Registry
        Import Modules : Decorators execute safely
        Use Registry : Query handlers
        Register : Send to platform

    section ❌ INCORRECT
        Import Modules : Decorators crash!
        Bootstrap : Too late
        Error : Application fails
```

### 🔑 Key Concepts

1. **Decorators execute at import time** - Not when class is instantiated
2. **Registry must be configured first** - Before any decorated class imports
3. **Metadata is type-safe** - TypeScript validates at compile time
4. **Keys are unique** - Each handler has a unique registry key
5. **Upsert behavior** - Same key replaces previous registration

### 📝 Example Decorator Usage

```typescript
// PingCommand.ts
import { SlashCommand } from "@gildraen/dbm-core";

type PingInteraction = {
  reply(content: string): Promise<unknown>;
};

@SlashCommand("ping", "Replies with pong!")
export class PingCommand {
  name = "PingCommand";

  async handle(interaction: PingInteraction): Promise<void> {
    await interaction.reply("Pong!");
  }

  buildCommand() {
    return {
      type: "slash" as const,
      name: "ping",
      description: "Replies with pong!",
    };
  }
}
```

When this file is imported, the decorator:

1. ✅ Creates metadata: `{ name: 'ping', description: 'Replies with pong!' }`
2. ✅ Gets registry from provider
3. ✅ Creates key: `'slash:ping'`
4. ✅ Stores descriptor with metadata and class reference
5. ✅ Returns the decorated class
