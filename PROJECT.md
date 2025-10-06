# Agor Project

> **Next-gen agent orchestration platform** - Manage unlimited AI coding agents in hyper-context-aware session trees.

**See [context/](context/) for complete architecture, data models, and design documentation.**

---

## What Is Agor?

**Agor is an agent orchestrator** - the platform layer that sits above all agentic coding tools (Claude Code, Cursor, Codex, Gemini), providing unified session management, visual session trees, and automatic knowledge capture.

**Core Insight:** Context engineering isn't about prompt templates—it's about managing sessions, tasks, and concepts as first-class composable primitives stored in a session tree.

**See:** [context/concepts/core.md](context/concepts/core.md) for vision and primitives.

---

## Architecture Overview

**Full Stack (V1 - Local Desktop):**

- **Frontend:** Vite + React + TypeScript + Ant Design + React Flow + Storybook
- **Backend:** FeathersJS (REST + WebSocket) + Drizzle ORM + LibSQL
- **CLI:** oclif + cli-table3
- **Desktop:** Electron/Tauri wrapper (TBD)

**Key Documents:**

- [context/concepts/models.md](context/concepts/models.md) - Data models (Session, Task, Board, Repo, Worktree)
- [context/concepts/design.md](context/concepts/design.md) - UI/UX standards and component patterns
- [context/explorations/architecture-api.md](context/explorations/architecture-api.md) - Backend API architecture
- [context/explorations/state-management.md](context/explorations/state-management.md) - Persistence layer (Drizzle + LibSQL)
- [context/explorations/cli.md](context/explorations/cli.md) - CLI command structure
- [context/explorations/git-worktree.md](context/explorations/git-worktree.md) - Git worktree integration
- [context/explorations/architecture-decision-review.md](context/explorations/architecture-decision-review.md) - Architecture validation

---

## Implementation Status

### ✅ Phase 1: UI Prototype (Completed)

**Location:** `agor-ui/`

**Components Implemented:**

- Session visualization (SessionCard, SessionHeader, SessionDrawer, SessionCanvas)
- Task display (TaskListItem with smart truncation)
- Board organization (SessionListDrawer, AppHeader, board filtering)
- Session creation flow (NewSessionModal, AgentSelectionCard)
- Two-drawer overlay pattern (left: session browser, right: session detail)

**Infrastructure:**

- TypeScript types for all primitives (Session, Task, Board, Agent, Repo, Worktree)
- Mock data layer (18+ realistic sessions, 4 agents, 3 boards)
- Storybook stories for all components (30+ stories total)
- React Flow canvas with fork/spawn edge visualization

**See:** `agor-ui/` directory for complete UI implementation.

---

### ✅ Phase 2a: Monorepo Setup (Completed - Oct 2025)

**Goal:** Establish bulletproof monorepo foundation with modern tooling.

**Completed:**

- ✅ Turborepo + pnpm workspace configuration
- ✅ Shared packages structure:
  - `@agor/types` - Shared TypeScript types (tsup build)
  - `@agor/drizzle-schema` - Database schema + UUIDv7 utilities
  - `@agor/feathers-client` - API client library
- ✅ Applications scaffolding:
  - `apps/agor-daemon` - FeathersJS backend (runs on :3030)
  - `apps/agor-cli` - oclif CLI with hello command
  - `apps/agor-ui` - React UI prototype (migrated from root)
- ✅ Developer tooling:
  - Biome (fast linter/formatter)
  - Prettier (code formatting)
  - Husky + lint-staged (pre-commit hooks)
  - Turborepo build pipelines with caching
- ✅ Drizzle schema foundation (hybrid materialization strategy)
  - Materialized columns for queries: status, agent, board_id, genealogy
  - JSON blob for nested/rarely-queried data
  - Cross-DB compatible (LibSQL V1 → PostgreSQL V2)
- ✅ UUIDv7 ID generation + short ID resolution utilities
- ✅ Repository pattern with full CRUD operations

**Verification:**

- All packages build successfully (`pnpm build`)
- Daemon runs with health endpoint (`curl http://localhost:3030/health`)
- CLI executable works (`pnpm --filter @agor/cli dev hello`)
- Git hooks active (lint-staged on commit)

---

### 🚧 Phase 2b: Drizzle + Persistence (Current - DRIZZLE TIME! 🌧️)

**Goal:** Make it rain with Drizzle ORM integration and database operations.

**Sprint 1: Drizzle Foundation (2-3 days)**

1. **Database initialization**
   - Create LibSQL client factory (`packages/drizzle-schema/src/client.ts`)
   - Database setup script (`scripts/setup-db.ts`)
   - Migration utilities (Drizzle Kit integration)
   - Initial schema push to SQLite

2. **Repository pattern implementation**
   - Base repository interface (`packages/drizzle-schema/src/repositories/base.ts`)
   - SessionRepository with CRUD operations
   - TaskRepository with session relationship
   - BoardRepository with session filtering
   - RepoRepository with worktree management

3. **Testing & validation**
   - Unit tests for ID generation/resolution
   - Repository CRUD tests
   - JSON blob serialization verification
   - Query performance benchmarks

**Sprint 2: FeathersJS Integration (3-4 days)** 4. **Custom Drizzle adapter for Feathers** (THE BIG ONE!)

- Adapter class implementing Feathers service interface
- Query translation (Feathers query syntax → Drizzle)
- Pagination support
- Hooks integration (before/after create/update/delete)
- Real-time event emission
- **Decision point:** If too complex, fallback to Knex adapter

5. **Daemon services**
   - Sessions service (create, find, get, update, remove)
   - Tasks service with session filtering
   - Boards service with session aggregation
   - Repos service with worktree operations
   - Health/status endpoints

6. **Daemon lifecycle**
   - Auto-start on CLI command
   - Process management (PID file, graceful shutdown)
   - Version checking (daemon vs CLI version mismatch detection)
   - Logging infrastructure

**Sprint 3: CLI Integration (2-3 days)** ⏳ In Progress 7. **Core CLI commands**

- ✅ `agor init` - Initialize ~/.agor directory and database
- [ ] `agor session list` - Table output with filters
- [ ] `agor session show <id>` - Detailed view with genealogy tree
- [ ] `agor session create` - Interactive session creation
- [ ] `agor config get/set` - Active context management
- [ ] `agor daemon start/stop/status` - Daemon control

8. **Daemon client integration**
   - [ ] Auto-start daemon if not running
   - [ ] Feathers client connection
   - [ ] Error handling (daemon not responding, version mismatch)
   - [ ] Short ID resolution in all commands

**Success Criteria:**

- [x] `agor init` creates ~/.agor structure and initializes database
- [ ] Create session via CLI → persists to SQLite
- [ ] List sessions with filters → correct table output
- [ ] Show session → displays full genealogy tree
- [ ] Daemon survives restarts with data intact
- [ ] Real-time events propagate (create session → UI updates)
- [ ] Short IDs resolve correctly (8-char prefix → full UUID)

**Deferred to Phase 3:**

- Agent adapter framework
- Fork/spawn operations
- Git worktree integration
- Concept management
- Report generation

**See:** [context/explorations/architecture-decision-review.md](context/explorations/architecture-decision-review.md) for Drizzle adapter decision tree.

---

## Project Structure

```
agor/
├── agor-ui/                      # UI prototype (Phase 1 - Complete)
│   ├── src/
│   │   ├── types/                # TypeScript types
│   │   ├── components/           # React components + .stories.tsx
│   │   ├── mocks/                # Mock data
│   │   └── App.tsx
│   └── package.json
│
├── packages/                     # Shared packages (Phase 2 - Planned)
│   ├── types/                    # Shared TypeScript types
│   ├── drizzle-schema/           # Database schema
│   └── feathers-client/          # API client
│
├── apps/                         # Applications (Phase 2 - Planned)
│   ├── agor-daemon/              # FeathersJS backend
│   ├── agor-cli/                 # oclif CLI
│   └── agor-desktop/             # Electron/Tauri wrapper
│
└── context/                      # Architecture documentation
    ├── concepts/                 # Core design docs
    │   ├── core.md               # Vision, primitives, philosophy
    │   ├── models.md             # Data models
    │   ├── architecture.md       # System design
    │   └── design.md             # UI/UX standards
    └── explorations/             # WIP architecture explorations
        ├── architecture-api.md   # Backend stack
        ├── state-management.md   # Persistence layer
        ├── cli.md                # CLI design
        ├── git-worktree.md       # Worktree strategy
        └── architecture-decision-review.md
```

**Monorepo:** Turborepo + pnpm (to be set up in Phase 2)

---

## Quick Start (UI Prototype)

```bash
cd agor-ui
npm install
npm run storybook    # Component development
npm run dev          # Full prototype
```

**See:** `agor-ui/README.md` for UI-specific documentation.

---

## Roadmap

### V1: Local Desktop App (Target: Q2 2025)

**Goal:** Full-featured local agent orchestrator with GUI + CLI

**Capabilities:**

- Multi-agent session management (Claude Code, Cursor, Codex, Gemini)
- Visual session tree canvas with fork/spawn relationships
- Git worktree integration for isolated parallel sessions
- CLI for terminal-based workflows
- Concept management (modular context library)
- Automatic report generation from task completions
- Local-only (no cloud, SQLite-based)

**Deliverables:**

- Desktop app (Electron or Tauri)
- CLI binary (`agor`)
- Documentation + tutorials

---

### V2: Agor Cloud (Target: Q4 2025)

**Goal:** Real-time collaborative agent orchestration

**New Capabilities:**

- Cloud-hosted sessions (LibSQL → PostgreSQL migration)
- Real-time multiplayer (multiple devs, same session tree)
- Shared concept libraries (team knowledge bases)
- Pattern recommendations (learn from successful session trees)
- Session replay/export for learning

**Tagline:** _Real-time strategy multiplayer for AI development_

**See:** [README.md](README.md) for full product vision.

---

## Development Principles

1. **Architecture-first** - Design docs in `context/` before implementation
2. **Type-driven** - TypeScript types define interfaces, Drizzle schema defines storage
3. **Storybook-first** (UI) - Components in isolation before integration
4. **Repository pattern** - Abstract storage layer for local → cloud migration
5. **Monorepo** - Share types/schema across daemon/CLI/UI
6. **Local-first** - V1 works completely offline, V2 adds cloud sync

---

## Next Steps (Immediate)

1. **Set up monorepo** (Turborepo + pnpm)
2. **Prototype Drizzle + Feathers adapter** (validate architectural risk)
3. **Build core persistence layer** (schema + repositories)
4. **Implement daemon** (FeathersJS services)
5. **Build CLI foundation** (oclif + core commands)

**See Phase 2 roadmap above for detailed priorities.**

---

## Contributing

**Before contributing:**

1. Read [context/concepts/core.md](context/concepts/core.md) - Understand primitives and vision
2. Read [CLAUDE.md](CLAUDE.md) - Development workflow and standards
3. Check `context/explorations/` for architecture decisions

**Code standards:**

- **UI:** Follow [context/concepts/design.md](context/concepts/design.md)
- **Backend:** Repository pattern, Drizzle ORM, FeathersJS services
- **CLI:** oclif conventions, entity-based commands
- **Types:** Shared via `packages/types/`

---

**Philosophy:** Architecture docs crystallize decisions. Code implements them. The UI prototype validated the vision—now we build the engine.
