# CLAUDE.md

This file provides guidance to Claude Code when working with the Agor codebase.

## Project Overview

**Agor** is an agent orchestration platform for AI-assisted development. It provides a unified interface to coordinate multiple AI coding agents (Claude Code, Cursor, Codex, Gemini), visualize session trees, and capture knowledge automatically.

**Current Status:** Backend implementation with FeathersJS daemon, CLI, and database layer

**Key Insight:** Context engineering is about managing sessions, tasks, and concepts as first-class composable primitives stored in a session tree.

## Architecture Documentation

All architectural documentation lives in `context/concepts/`. **Read these first** before making changes:

### Core Concepts (Start Here)
- **`context/concepts/core.md`** - Five core primitives (Session, Task, Report, Worktree, Concept), vision, core insights
- **`context/concepts/models.md`** - Canonical data model definitions and relationships
- **`context/concepts/architecture.md`** - System design, storage structure, and component interactions
- **`context/concepts/id-management.md`** - UUIDv7 implementation, short IDs, and branded types
- **`context/concepts/design.md`** - UI/UX standards and component patterns (for agor-ui work)

### Explorations (WIP/Future)
- `context/explorations/agent-interface.md` - Agent abstraction layer design
- `context/explorations/state-management.md` - Drizzle + LibSQL persistence patterns
- `context/explorations/state-broadcasting.md` - Real-time sync architecture

## Project Structure

```
agor/
├── apps/
│   ├── agor-daemon/         # FeathersJS backend (REST + WebSocket)
│   │   └── src/
│   │       ├── services/    # Sessions, Tasks, Messages, Repos, Boards
│   │       └── index.ts     # Main daemon entry point
│   │
│   ├── agor-cli/            # CLI tool (oclif-based)
│   │   └── src/commands/    # session/, repo/, board/ commands
│   │
│   └── agor-ui/             # React UI prototype (Storybook-first)
│       └── src/             # Components, types, mocks
│
├── packages/
│   └── core/                # Shared @agor/core package
│       └── src/
│           ├── types/       # TypeScript types (Session, Task, Message, etc.)
│           ├── db/          # Drizzle ORM + repositories + schema
│           ├── git/         # Git utils (clone, worktree management)
│           ├── claude/      # Claude Code session loading utilities
│           └── api/         # FeathersJS client utilities
│
├── context/                 # Architecture documentation
│   ├── concepts/            # Core design docs (READ THESE FIRST)
│   └── explorations/        # Experimental designs
│
├── README.md               # Product vision and overview
└── PROJECT.md              # Implementation roadmap and status
```

## Tech Stack

### Backend (Current Focus)
- **FeathersJS** - REST + WebSocket API framework
- **Drizzle ORM** - Type-safe database layer
- **LibSQL** - SQLite-compatible database (local file + future cloud sync)
- **simple-git** - Git operations for repo/worktree management

### Frontend (UI Prototype)
- **React 19 + TypeScript + Vite**
- **Ant Design** - Component library (dark mode default, strict token usage)
- **Storybook** - Component development
- **React Flow** - Session tree canvas visualization

### CLI
- **oclif** - CLI framework
- **chalk** - Terminal colors and formatting
- **cli-table3** - Table rendering

## Development Commands

### Daemon
```bash
cd apps/agor-daemon
pnpm dev                    # Start daemon on :3030
curl http://localhost:3030/health  # Check health
```

### CLI
```bash
# Run commands from project root
pnpm agor session list              # List sessions
pnpm agor session load-claude <id>  # Load Claude Code session
pnpm agor repo add <url>            # Clone and register repo
pnpm agor repo list                 # List repos

# Or use the dev script directly
cd apps/agor-cli
./bin/dev.ts session list
```

### UI
```bash
cd apps/agor-ui
pnpm storybook              # Start Storybook on :6006
pnpm dev                    # Start Vite dev server
pnpm typecheck              # TypeScript checking
pnpm test                   # Vitest tests
```

### Database
```bash
# Initialize database schema
cd packages/core
pnpm exec tsx src/db/scripts/setup-db.ts

# Default location: ~/.agor/agor.db
# Inspect with: sqlite3 ~/.agor/agor.db
```

## Core Primitives

See `context/concepts/core.md` for full details.

1. **Session** - Container for agent interactions with genealogy (fork/spawn), git state, concepts, tasks
2. **Task** - User prompts as first-class work units tracking git state, tool usage, message ranges
3. **Message** - Conversation messages stored in database with session/task references
4. **Worktree** - Git worktrees for session isolation (managed by Agor)
5. **Concept** - Modular context files that compose into session-specific knowledge

## Data Models

See `context/concepts/models.md` for canonical definitions.

**Key Types** (in `packages/core/src/types/`):
- `Session` - session_id, agent, status, repo, git_state, genealogy, concepts, tasks
- `Task` - task_id, session_id, status, description, message_range, git_state
- `Message` - message_id, session_id, task_id, type, role, content, tool_uses
- `Repo` - repo_id, slug, remote_url, local_path, worktrees
- `Board` - board_id, name, sessions (organize sessions like Trello)

**ID Management** (see `context/concepts/id-management.md`):
- UUIDv7 for time-ordered unique IDs
- Branded types for type safety: `SessionID`, `TaskID`, `MessageID`, etc.
- Short ID display format: `0199b856` (first 8 chars)
- Full resolution in repositories via fuzzy matching

## Database Schema

See `context/concepts/architecture.md` for full schema.

**Tables** (SQLite via LibSQL + Drizzle):
- `sessions` - Session records with materialized columns + JSON data blob
- `tasks` - Task records linked to sessions
- `messages` - Conversation messages (indexed by session_id, task_id, index)
- `repos` - Git repositories registered with Agor
- `boards` - Session organization boards

**Hybrid Storage Strategy:**
- Materialized columns for filtering/joins (status, agent, timestamps)
- JSON blobs for nested data (genealogy, git_state, metadata)
- B-tree indexes on frequently queried fields

## FeathersJS Services

Located in `apps/agor-daemon/src/services/`:

**Core Services:**
- `/sessions` - CRUD + fork/spawn/genealogy custom methods
- `/tasks` - CRUD + complete/fail custom methods
- `/messages` - CRUD + `/messages/bulk` for batch inserts
- `/repos` - CRUD + `/repos/clone` and worktree management
- `/boards` - CRUD + session association

**Custom Routes:**
- `POST /sessions/:id/fork` - Fork session at decision point
- `POST /sessions/:id/spawn` - Spawn child session
- `GET /sessions/:id/genealogy` - Get full genealogy tree
- `POST /repos/clone` - Clone and register repository
- `POST /repos/:id/worktrees` - Create git worktree
- `POST /messages/bulk` - Bulk insert messages (batched for performance)
- `POST /tasks/bulk` - Bulk insert tasks (batched for performance)
- `POST /tasks/:id/complete` - Mark task as completed with optional report
- `POST /tasks/:id/fail` - Mark task as failed with error message

## CLI Commands

See `apps/agor-cli/src/commands/` for implementations.

**Session Commands:**
- `session list` - List all sessions in table format
- `session show <id>` - Show session details
- `session load-claude <id>` - Import Claude Code session from transcript
  - Parses JSONL transcript from `~/.claude/projects/`
  - Bulk inserts messages (batched at 100)
  - Extracts tasks from user messages (batched at 100)
  - Updates session with task IDs
  - Optional `--board` flag to add to board

**Repo Commands:**
- `repo list` - List registered repositories
- `repo add <url>` - Clone and register git repository

**Important CLI Patterns:**
- Always use socket cleanup: `await new Promise<void>((resolve) => { client.io.on('disconnect', resolve); client.io.close(); setTimeout(resolve, 1000); }); process.exit(0);`
- No stacktraces on errors: Use `this.log(chalk.red('✗ Error'))` + `process.exit(1)` instead of `this.error()`
- Show progress for long operations (e.g., batched message inserts)

## Git Integration

See `context/concepts/architecture.md` for git workflows.

**Repository Management:**
- Clone to `~/.agor/repos/<name>`
- Track in database with metadata (default_branch, remote_url, etc.)

**Worktree Isolation:**
- Create worktrees in `~/.agor/worktrees/<repo>/<worktree-name>`
- Each session gets isolated working directory
- Enables parallel work across multiple sessions/agents

**Git State Tracking:**
```typescript
git_state: {
  ref: string;              // Branch/tag name
  base_sha: string;         // Starting commit
  current_sha: string;      // Current commit (can be "{sha}-dirty")
}
```

## Message Storage

See implementation in `packages/core/src/db/repositories/messages.ts`.

**Message Table:**
- Stores full conversation history from agent sessions
- Indexed by session_id, task_id, and (session_id, index)
- Content stored in JSON blob with preview field for display
- Supports bulk inserts (batched at 100 messages for performance)

**Message Types:**
- `user` - User input messages
- `assistant` - Agent responses
- `system` - System messages
- `file-history-snapshot` - File state snapshots

**Loading Claude Code Sessions:**
- Parse JSONL transcript from `~/.claude/projects/`
- Filter to conversation messages (exclude meta/snapshots)
- Convert to Agor message format
- Bulk insert in batches to avoid timeout

## Task Extraction

See implementation in `packages/core/src/claude/task-extractor.ts`.

**Architecture:**
- **Messages** = Immutable append-only event log
- **Tasks** = Mutable state containers tracking conversation turns

**Extraction Logic:**
- Each user message defines a task boundary
- Message range spans from user message to next user message (or end)
- Tasks are extracted with:
  - `full_prompt` - Complete user input
  - `description` - First 120 chars for display
  - `message_range` - start_index, end_index, timestamps
  - `tool_use_count` - Aggregated from all messages in range
  - `status: 'completed'` - Historical sessions are always complete
  - `git_state.sha_at_start: 'unknown'` - No git tracking in Claude Code transcripts

**Bulk Operations:**
- `/tasks/bulk` endpoint for efficient batch creation
- Batched at 100 tasks per request
- Returns created task records for session linking

## Development Workflow

### Adding New Features
1. **Read architecture docs first** - `context/concepts/architecture.md`
2. **Check data models** - `context/concepts/models.md`
3. **Update types** - `packages/core/src/types/`
4. **Add repository layer** - `packages/core/src/db/repositories/`
5. **Create service** - `apps/agor-daemon/src/services/`
6. **Register in daemon** - `apps/agor-daemon/src/index.ts`
7. **Add CLI command** - `apps/agor-cli/src/commands/`

### Code Standards
- **Type-driven:** Use branded types for IDs, strict TypeScript
- **Read before edit:** Always read files before modifying
- **Prefer Edit over Write:** Modify existing files when possible
- **Error handling:** Clean user-facing errors, no stacktraces in CLI
- **Socket cleanup:** Always close FeathersJS client sockets properly
- **Batch operations:** Use batching for bulk database operations (100-500 items)

### Testing
```bash
# Database operations
sqlite3 ~/.agor/agor.db "SELECT COUNT(*) FROM messages"

# Daemon health
curl http://localhost:3030/health

# CLI commands (always exit cleanly, no hanging)
pnpm agor session list
pnpm agor repo list
```

## Implementation Status

**Completed:**
- ✅ Database schema with all tables (sessions, tasks, messages, repos, boards)
- ✅ FeathersJS daemon with REST + WebSocket APIs
- ✅ Repository layer with Drizzle ORM
- ✅ CLI with session/repo commands
- ✅ Claude Code session loading with message import
- ✅ Task extraction from user messages (Messages → Tasks architecture)
- ✅ Bulk insert endpoints (/messages/bulk, /tasks/bulk)
- ✅ Git repository and worktree management
- ✅ UUIDv7 IDs with short ID display
- ✅ Socket cleanup and error handling

**In Progress:**
- 🔄 UI integration with backend APIs
- 🔄 Report generation from tasks
- 🔄 Real-time task state updates

**Future:**
- 📋 Agent interface abstraction layer
- 📋 Real-time collaboration features
- 📋 Cloud sync with Turso

See `PROJECT.md` for detailed roadmap.

## Philosophy

- **Architecture-first:** Document decisions in `context/concepts/` before implementing
- **Type safety:** Branded types, strict TypeScript, runtime validation
- **Local-first:** SQLite-based, works offline, optional cloud sync
- **Agent-agnostic:** Abstract interface for Claude Code, Cursor, Codex, Gemini
- **Git-native:** Worktrees for isolation, commit tracking, reproducibility
- **Modular context:** Concepts compose into session-specific knowledge bases
