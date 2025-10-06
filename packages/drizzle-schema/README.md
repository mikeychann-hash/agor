# @agor/drizzle-schema

Drizzle ORM database layer for Agor - the agent orchestration platform.

## Features

- **Type-safe repositories** - Full TypeScript inference from schema to queries
- **JSON-heavy schema** - Minimal migrations, maximum flexibility
- **UUIDv7 IDs** - Time-ordered, globally unique identifiers
- **Short ID support** - Git-style 8-character prefixes with collision detection
- **LibSQL/SQLite** - Local development, cloud-ready (Turso)
- **Repository pattern** - Abstract database layer for future migration

## Installation

```bash
pnpm install
```

## Quick Start

### 1. Setup Database

```bash
# Initialize database with default schema
pnpm run db:setup

# Or with custom path
pnpm run db:setup -- --path ./custom.db

# Reset database (drop and recreate)
pnpm run db:setup -- --reset
```

### 2. Use Repositories

```typescript
import {
  createDatabase,
  SessionRepository,
  TaskRepository,
  BoardRepository,
  RepoRepository,
} from '@agor/drizzle-schema';

// Create database connection
const db = createDatabase({ url: 'file:~/.agor/sessions.db' });

// Initialize repositories
const sessions = new SessionRepository(db);
const tasks = new TaskRepository(db);
const boards = new BoardRepository(db);
const repos = new RepoRepository(db);

// Create a session
const session = await sessions.create({
  agent: 'claude-code',
  status: 'idle',
  repo: {
    cwd: '/Users/max/project',
    managed_worktree: false,
  },
  git_state: {
    ref: 'main',
    base_sha: 'abc123',
    current_sha: 'abc123',
  },
});

console.log(session.session_id); // Full UUID
// => "0199b73d-b52e-7ed1-b028-277d6ad08cef"

// Query by short ID
const found = await sessions.findById('0199b73d');
console.log(found?.session_id);
// => "0199b73d-b52e-7ed1-b028-277d6ad08cef"
```

### 3. Run Tests

```bash
# Type checking
pnpm run typecheck

# Integration tests
pnpm run test:integration
```

## Architecture

### JSON-Heavy Schema Strategy

Only materialized columns for filtering/sorting:

- `session_id`, `created_at`, `updated_at`, `status`
- Everything else in JSON `data` column

This minimizes migrations - schema evolution happens via TypeScript type updates.

### Repository Pattern

```typescript
// Base interface
interface BaseRepository<T, TInsert> {
  create(data: TInsert): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(id: string, updates: Partial<TInsert>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Specialized repositories
class SessionRepository extends BaseRepository<Session> {
  findByStatus(status: SessionStatus): Promise<Session[]>;
  findChildren(sessionId: string): Promise<Session[]>;
  findAncestors(sessionId: string): Promise<Session[]>;
}
```

### Short ID Resolution

- Store full UUIDv7 (36 chars): `0199b73d-b52e-7ed1-b028-277d6ad08cef`
- Display 8-char prefix: `0199b73d`
- Efficient B-tree prefix matching: `LIKE 'prefix%'`
- Automatic collision detection (expand to 12+ chars if ambiguous)

## Database Schema

### Sessions

```sql
CREATE TABLE sessions (
  session_id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  updated_at INTEGER,
  status TEXT NOT NULL CHECK(status IN ('idle', 'running', 'completed', 'failed')),
  data TEXT NOT NULL  -- JSON blob
);

CREATE INDEX sessions_status_idx ON sessions(status);
CREATE INDEX sessions_created_idx ON sessions(created_at);
```

### Tasks

```sql
CREATE TABLE tasks (
  task_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  completed_at INTEGER,
  status TEXT NOT NULL CHECK(status IN ('created', 'running', 'completed', 'failed')),
  data TEXT NOT NULL,  -- JSON blob
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX tasks_session_idx ON tasks(session_id);
CREATE INDEX tasks_status_idx ON tasks(status);
CREATE INDEX tasks_created_idx ON tasks(created_at);
```

### Boards

```sql
CREATE TABLE boards (
  board_id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  updated_at INTEGER,
  data TEXT NOT NULL  -- JSON blob
);
```

### Repos

```sql
CREATE TABLE repos (
  repo_id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  updated_at INTEGER,
  slug TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL  -- JSON blob
);

CREATE INDEX repos_slug_idx ON repos(slug);
```

## Migration Path: V1 → V2

### V1: Local Desktop App

```typescript
const db = createDatabase({
  url: 'file:~/.agor/sessions.db',
});
```

### V2: Cloud Sync (Turso)

```typescript
const db = createDatabase({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,

  // Optional: Embedded replica for offline-first
  syncUrl: process.env.TURSO_DATABASE_URL,
});
```

**Same code, just different connection config.**

## Scripts

- `pnpm run db:setup` - Initialize database
- `pnpm run db:studio` - Open Drizzle Studio (visual DB editor)
- `pnpm run db:generate` - Generate migrations
- `pnpm run test:integration` - Run integration tests
- `pnpm run typecheck` - TypeScript type checking
- `pnpm run build` - Build for production

## Development Workflow

1. **Schema changes**: Update `src/schema.ts` types
2. **Repository changes**: Update repository methods in `src/repositories/`
3. **Type check**: `pnpm run typecheck`
4. **Test**: `pnpm run test:integration`
5. **Build**: `pnpm run build`

## File Structure

```
packages/drizzle-schema/
├── src/
│   ├── schema.ts          # Drizzle schema definitions
│   ├── ids.ts             # UUIDv7 generation & short ID resolution
│   ├── client.ts          # LibSQL client factory
│   ├── migrate.ts         # Migration runner
│   ├── repositories/      # Repository pattern
│   │   ├── base.ts
│   │   ├── sessions.ts
│   │   ├── tasks.ts
│   │   ├── boards.ts
│   │   └── repos.ts
│   └── index.ts           # Public exports
├── scripts/
│   ├── setup-db.ts        # Database initialization
│   └── test-integration.ts # Integration tests
├── drizzle.config.ts      # Drizzle Kit configuration
└── package.json
```

## Next Steps (Sprint 2)

1. **FeathersJS Adapter** - REST/WebSocket API layer
2. **Daemon Lifecycle** - Background process management
3. **CLI Integration** - `agor session list`, `agor session show <id>`

See `DRIZZLE_ATTACK.md` for full roadmap.
