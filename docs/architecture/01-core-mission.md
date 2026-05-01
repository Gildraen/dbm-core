# Core Mission

## Purpose

The **core** is the internal framework used to build modular Discord bots.

Its purpose is to provide stable contracts and runtime orchestration for bot
modules while keeping infrastructure concerns isolated from module logic.

The core defines how modules declare their behavior, how they interact with
the runtime, and how they access shared services.

Discord is the target platform of the framework. However, the core must not
expose raw `discord.js` objects or SDK-specific structures to modules.

Instead, the core provides simplified contracts and contexts that represent
the bot domain in a stable and maintainable way.

---

## Design Goals

The architecture of the core is driven by the following goals:

**Modularity**

The bot must be composed of independent modules that can be enabled or disabled
through configuration.

**Stable contracts**

Modules should depend only on the core API, not on infrastructure
implementations.

**Infrastructure isolation**

The core must isolate modules from the Discord SDK and other infrastructure
details.

**Runtime orchestration**

The core coordinates module loading, handler registration, and runtime
execution.

**Simplicity over abstraction**

The core favors clear domain concepts and maintainable architecture over
unnecessary abstraction layers.

---

## Core Responsibilities

The core is responsible for defining and managing:

- the module system
- module lifecycle and registration
- handler contracts used by modules
- runtime orchestration of module behavior
- shared services and utilities exposed to modules
- configuration integration
- the boundary between modules and infrastructure

The core defines **how modules integrate with the runtime** without exposing
infrastructure-specific implementation details.

---

## Infrastructure Boundary

The core must remain independent from the Discord SDK.

Infrastructure concerns belong in dedicated adapters that translate Discord
events and interactions into the contracts defined by the core.

This includes responsibilities such as:

- connecting to Discord
- registering slash commands
- receiving Discord events
- mapping Discord interactions into runtime contexts

Modules must never depend directly on `discord.js`.

Infrastructure implementations may depend on external libraries, but these
dependencies must remain outside the module-facing contracts of the core.

---

## Module-Centric Architecture

The architecture revolves around **modules**.

Modules define the behavior of the bot and may provide elements such as:

- commands
- event listeners
- interaction handlers
- module configuration
- module-specific services

The core defines how these elements are declared and how they are integrated
into the runtime.

Modules must remain independent from infrastructure concerns and interact only
with the contracts provided by the core.

---

## Runtime Role

The runtime coordinates the execution of the bot by:

- loading enabled modules
- registering handlers declared by modules
- wiring infrastructure events to module handlers
- managing shared services
- ensuring modules operate within the core contracts

The runtime is responsible for orchestration, not for implementing module
logic.

---

## Configuration

The system supports a configuration-driven module model.

Configuration determines:

- which modules are enabled
- module-specific settings
- runtime behavior

This allows different bot instances to run with different module sets while
sharing the same core framework.

---

## Distribution Model

The architecture is designed around independently distributed libraries.

The core framework is published as a standalone library that provides the
contracts, runtime orchestration, and utilities required to build modular
Discord bots.

Each bot module is also published as an independent library.

Modules depend only on the core framework and must not depend directly on
infrastructure implementations such as `discord.js`.

A bot instance acts primarily as a composition layer. Its responsibilities are:

- loading the configuration
- enabling the desired modules
- installing required module dependencies
- starting the runtime

This design allows different bot instances to run with different module sets
while sharing the same core framework.

Modules can be developed, versioned, and distributed independently.

---

## Dependency Direction

The dependency direction of the architecture must remain consistent.

Modules depend on the core.

The core must never depend on modules.

Infrastructure implementations may depend on both the core and external
libraries such as `discord.js`.

Modules must only depend on the public API of the core.

---

## Non Goals

The core is not intended to be:

- a generic multi-platform bot framework
- a full abstraction of every possible messaging platform
- a wrapper around the Discord SDK
- a replacement for `discord.js`

The goal is to build a **clean, modular Discord bot architecture**, not a
platform-agnostic runtime.

---

## Architectural Philosophy

The core favors:

- clear domain boundaries
- simple and explicit contracts
- maintainable modular structure
- separation of responsibilities

Over-engineered abstraction layers should be avoided unless they provide clear
practical value.

The core should remain **simple, predictable, and stable**, allowing modules
to evolve independently from infrastructure concerns.
