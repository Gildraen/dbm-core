---
applyTo: "**"
description: "Project vision and architectural principles learned through interactions"
---

# Project Vision & Learning Log

## Core Philosophy

### Discord Bot Module Ecosystem

- **Core Library**: `@gildraen/dbm-core` - Pure orchestration framework
- **Module Packages**: Independent npm packages (e.g., `@myorg/discord-economy-module`)
- **Clean Separation**: Core coordinates, modules handle their own business logic

### Architecture Principles

- **Simplicity Over Complexity**: Avoid over-engineering, prefer simple solutions
- **Module Autonomy**: Modules should be completely independent packages
- **No Schema Merging**: Each module manages its own Prisma schema independently
- **Orchestration Not Control**: Core orchestrates, doesn't dictate implementation

## Key Learnings

### Architecture Evolution & Simplification

- **Started with**: Complex schema discovery and merging system
- **Evolved to**: Simple orchestration with independent module packages
- **Key insight**: Package.json already handles module discovery, no need for complex registry
- **Final design**: Core provides orchestration, modules are self-contained npm packages

### Deployment Architecture

- **Pattern**: CLI-first deployment with multi-container approach
- **Flow**: Migration container → Command registration container → Main bot container
- **Separation**: Setup (migrations/commands) vs Runtime (Discord bot logic)
- **Main bot role**: Only handles Discord startup and handler setup, never calls setup functions
- **Primary interfaces**: `yarn dbm-migrate` and `yarn dbm-register-commands` CLI tools

### Command & Event Handling

- **Module responsibility**: Modules register their own command handlers directly with Discord
- **During `register()`**: Modules call `client.on('interactionCreate')` to set up command handling
- **During `setupHandlers()`**: Modules register all their Discord event listeners
- **Bot responsibility**: Only handle general Discord events (member joins, reactions, etc.)
- **No routing needed**: Discord routes slash commands to module handlers automatically
- **Context requirements**: RegisterContext must include Discord client for command and handler registration

### Main Bot Minimalism

- **Core insight**: Main bot does virtually nothing except start and setup handlers
- **Complete lifecycle**: `client.login()` → `client.on('ready')` → `setupHandlers.execute(client)` → Done
- **Handler orchestration**: Core provides `SetupModuleHandlers` use case for coordinated setup
- **Module autonomy**: Modules handle all their own Discord event logic via `setupHandlers(client)`
- **Minimal surface**: Main bot has almost no logic - just orchestrates module handler setup
- **Clean separation**: Setup phase (CLI) vs Handler registration (use case) vs Runtime (module logic)

### Standards & Preferences

- **Package Manager**: Always use `yarn` in documentation, never `npm`
- **Documentation**: Consistency across all markdown files is crucial
- **Testing**: All tests should pass, maintain high coverage
- **Commit Style**: Conventional commits with clear scopes

### Technical Decisions

- **Migration Tracking**: Removed core Migration model - modules handle their own tracking
- **Database Access**: Core provides shared Prisma client, modules use their own schemas
- **Error Handling**: Orchestration reports success/failure, doesn't interfere with module logic
- **Configuration**: Simple JSON config file, modules get their own settings section

## Future Considerations

- Continue learning from each interaction
- Adapt documentation and architecture based on feedback
- Maintain focus on simplicity and module independence
- Always validate understanding before making changes

## Action Items

- [ ] Keep updating this learning log with each significant interaction
- [ ] Ensure all documentation uses `yarn` consistently
- [ ] Maintain architectural simplicity as new features are requested
- [ ] Always ask for clarification when unsure about vision alignment
