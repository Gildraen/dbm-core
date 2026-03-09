# System Initialization Workflow

## Overview

This diagram shows how the core library must be initialized before any registry operations can occur.

## Initialization Flow

```mermaid
sequenceDiagram
    participant App as Application Entry Point
    participant Config as ConfigManager
    participant Factory as RegistryFactory
    participant Provider as RegistryProvider
    participant Registry as InMemoryRegistry

    App->>Config: getCoreConfig()
    Config-->>App: CoreConfigType { registry: { type: 'in-memory' } }

    App->>Factory: createRegistry(config.registry)
    Factory->>Factory: switch (config.type)

    alt type === 'in-memory'
        Factory->>Registry: new InMemoryRegistry()
        Registry-->>Factory: registry instance
    else type === 'discord'
        Factory->>Factory: throw "Not implemented"
    end

    Factory-->>App: PlatformRegistryInterface

    App->>Provider: configure(registry)
    Provider->>Provider: Check if already configured

    alt Already configured
        Provider-->>App: throw Error
    else Not configured
        Provider->>Provider: this.registry = registry
        Provider-->>App: ✅ Success
    end

    Note over App,Registry: Registry is now ready for use!
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Uninitialized: Application starts

    Uninitialized --> LoadingConfig: Load .dbmrc.json
    LoadingConfig --> ConfigLoaded: Config validated
    LoadingConfig --> Error: Invalid config

    ConfigLoaded --> CreatingRegistry: createRegistry()
    CreatingRegistry --> RegistryCreated: Factory returns instance
    CreatingRegistry --> Error: Unknown registry type

    RegistryCreated --> ConfiguringProvider: configure()
    ConfiguringProvider --> Ready: Provider configured
    ConfiguringProvider --> Error: Already configured

    Ready --> [*]: Can use decorators & registry
    Error --> [*]: Application crash

    note right of Ready
        All decorators and registry
        operations are now safe
    end note
```

## Component Interaction

```mermaid
flowchart TB
    subgraph Bootstrap["Bootstrap Phase"]
        Entry["Entry Point<br/>CLI or App Start"]
        Config["ConfigManager<br/>Load .dbmrc.json"]
        Factory["RegistryFactory<br/>Create registry instance"]
        Provider["RegistryProvider<br/>Configure global instance"]
    end

    subgraph Usage["Usage Phase"]
        Decorators["Decorators<br/>@SlashCommand @Event etc"]
        Registry["Registry Operations<br/>upsert list get"]
        Services["Services<br/>Registration and Queries"]
    end

    Entry -->|"1. getCoreConfig"| Config
    Config -->|"2. registry config"| Factory
    Factory -->|"3. registry instance"| Provider
    Provider -.->|"Enables"| Decorators
    Provider -.->|"Enables"| Registry
    Provider -.->|"Enables"| Services

    style Entry fill:#e1f5ff
    style Provider fill:#c8e6c9
    style Decorators fill:#fff9c4
    style Registry fill:#fff9c4
    style Services fill:#fff9c4
```

## Critical Notes

⚠️ **IMPORTANT**:

- `registryProvider.configure()` MUST be called before any decorator executes
- Configuration can only happen once (unless `reset()` is called)
- All decorators will throw if provider not configured
- This initialization must happen at application bootstrap

## Example Implementation

```typescript
// bootstrap.ts
import { config } from "@gildraen/dbm-core";
import {
  createRegistry,
  registryProvider,
} from "@gildraen/dbm-core/infrastructure";

export function initializeCore() {
  // 1. Get core configuration
  const coreConfig = config.getCoreConfig();

  // 2. Create registry based on config type
  const registry = createRegistry(coreConfig.registry);

  // 3. Configure the global provider
  registryProvider.configure(registry);

  console.log("✅ Core initialized and ready");
}

// main.ts
import { initializeCore } from "./bootstrap.js";

// CRITICAL: Initialize before importing any decorated modules
initializeCore();

// Now safe to import modules with decorators
import "./modules/my-module/index.js";
```
