# 🌧️ DRIZZLE ATTACK PLAN

**Status:** Sprint 1 - Database Foundation
**Start Date:** Oct 5, 2025
**Target:** 7-10 days to complete all 3 sprints

---

## Sprint 1: Drizzle Foundation (2-3 days)

### Day 1: Database Initialization ✅ COMPLETE

**Completed by Subagent:**

- ✅ Drizzle schema defined with hybrid strategy
- ✅ LibSQL client factory (`src/client.ts`)
- ✅ Database setup script (`scripts/setup-db.ts`)
- ✅ Drizzle Kit configuration (`drizzle.config.ts`)
- ✅ Migration runner (`src/migrate.ts`)
- ✅ UUIDv7 generation + short ID resolution

**Schema Improvements (Oct 5):**

- ✅ Materialized commonly-queried columns (agent, board_id, genealogy)
- ✅ Cross-DB compatible (no SQLite-specific JSON functions)
- ✅ Indexed for performance (status, agent, board, parent/fork relationships)
- ✅ JSON blob for nested/rarely-queried data

**Files to Create:**

```
packages/drizzle-schema/
├── src/
│   ├── client.ts           # LibSQL client factory
│   ├── migrate.ts          # Migration runner
│   └── repositories/       # Repository pattern
│       ├── base.ts
│       ├── sessions.ts
│       ├── tasks.ts
│       ├── boards.ts
│       └── repos.ts
├── drizzle.config.ts       # Drizzle Kit config
└── migrations/             # Generated migrations
```

---

### Day 2: Repository Pattern

**Goals:**

- [ ] Base repository interface with generic CRUD
- [ ] SessionRepository implementation
  - [ ] `create(session)` - Insert with UUIDv7 generation
  - [ ] `findById(id)` - Support short ID resolution
  - [ ] `findByStatus(status)` - Filter by status
  - [ ] `findByBoard(boardId)` - Filter by board
  - [ ] `update(id, updates)` - Partial updates
  - [ ] `delete(id)` - Soft or hard delete
- [ ] TaskRepository implementation
  - [ ] `findBySession(sessionId)` - All tasks for session
  - [ ] `findRunning()` - Active tasks across sessions
- [ ] BoardRepository implementation
- [ ] RepoRepository implementation

**Testing:**

- [ ] Unit tests for each repository
- [ ] Test JSON serialization/deserialization
- [ ] Test short ID resolution in queries

---

### Day 3: Integration Testing

**Goals:**

- [ ] End-to-end repository tests
- [ ] Performance benchmarks (insert 1000 sessions)
- [ ] Genealogy queries (find all descendants)
- [ ] JSON field updates (modify nested data)
- [ ] Transaction support verification

---

## Sprint 2: FeathersJS Integration (3-4 days)

### Day 4-5: Custom Drizzle Adapter (THE BIG ONE!)

**Research Phase:**

- [ ] Study existing Feathers adapters (Knex, Sequelize)
- [ ] Map Feathers query syntax to Drizzle equivalents
- [ ] Design adapter interface

**Implementation:**

```typescript
// apps/agor-daemon/src/adapters/drizzle.ts
class DrizzleAdapter implements ServiceAdapter {
  async find(params) {
    // Translate Feathers query → Drizzle query
    // Support: $select, $limit, $skip, $sort, $or, $and
  }

  async get(id, params) {
    /* ... */
  }
  async create(data, params) {
    /* ... */
  }
  async update(id, data, params) {
    /* ... */
  }
  async patch(id, data, params) {
    /* ... */
  }
  async remove(id, params) {
    /* ... */
  }
}
```

**Decision Point:**

- ✅ If adapter works smoothly → proceed
- ❌ If too complex (>2 days) → fallback to Knex

---

### Day 6: Daemon Services

**Goals:**

- [ ] Sessions service using Drizzle adapter
- [ ] Tasks service with session relationship
- [ ] Boards service
- [ ] Repos service
- [ ] Configure hooks (validation, timestamps)
- [ ] Real-time event emission testing

**Test:**

```bash
# Create session via REST
curl -X POST http://localhost:3030/sessions -d '{"agent":"claude-code"}'

# List sessions
curl http://localhost:3030/sessions

# Get session by ID
curl http://localhost:3030/sessions/01933e4a
```

---

### Day 7: Daemon Lifecycle

**Goals:**

- [ ] PID file management (`~/.agor/daemon.pid`)
- [ ] Auto-start logic (check if running, spawn if not)
- [ ] Graceful shutdown (close DB connections, WebSocket cleanup)
- [ ] Version mismatch detection
- [ ] Logging (winston or pino)

---

## Sprint 3: CLI Integration (2-3 days)

### Day 8: Core Commands

**Implement:**

```bash
# Session management
agor session list [--status running] [--board experiments]
agor session show <id>
agor session create --agent claude-code --prompt "Fix auth bug"

# Config management
agor config get board
agor config set board experiments

# Daemon control
agor daemon status
agor daemon start
agor daemon stop
agor daemon restart
```

**Files:**

```
apps/agor-cli/src/commands/
├── session/
│   ├── list.ts
│   ├── show.ts
│   └── create.ts
├── config/
│   ├── get.ts
│   └── set.ts
└── daemon/
    ├── status.ts
    ├── start.ts
    └── stop.ts
```

---

### Day 9: Daemon Client Integration

**Goals:**

- [ ] Auto-start daemon in CLI commands
- [ ] Feathers client connection handling
- [ ] Error messages (daemon not running, connection failed)
- [ ] Retry logic
- [ ] Health check before operations

---

### Day 10: Polish & Testing

**Goals:**

- [ ] CLI output formatting (cli-table3)
- [ ] Short ID resolution in all commands
- [ ] Error handling polish
- [ ] Integration tests (CLI → daemon → DB)
- [ ] Documentation updates

---

## Success Metrics

**Must Pass:**

1. Create 100 sessions via CLI → all persist correctly
2. Query sessions with filters → correct results
3. Show session with genealogy → ASCII tree displays
4. Daemon restarts → data intact, no corruption
5. Short IDs resolve uniquely (handle collisions)
6. Real-time events work (WebSocket connection)

**Performance:**

- Insert session: < 10ms
- Query 1000 sessions: < 100ms
- Short ID lookup: < 5ms

---

## Risks & Mitigations

| Risk                        | Likelihood | Impact | Mitigation                        |
| --------------------------- | ---------- | ------ | --------------------------------- |
| Drizzle adapter too complex | Medium     | High   | Prototype first, fallback to Knex |
| JSON queries slow           | Low        | Medium | Add indexes on filtered columns   |
| Short ID collisions         | Low        | High   | Expand to 12 chars if needed      |
| Daemon startup flaky        | Medium     | Medium | Robust PID checking, retry logic  |

---

## Decision Log

**Pending Decisions:**

- [ ] Drizzle adapter vs Knex fallback (Day 5)
- [ ] Soft delete vs hard delete for sessions
- [ ] Migration strategy (auto-migrate vs manual)
- [ ] Logging framework (winston vs pino)

**Made Decisions:**

- ✅ Use LibSQL for V1 (local file)
- ✅ JSON-heavy schema (minimal materialized columns)
- ✅ UUIDv7 for all IDs
- ✅ 8-char short IDs by default
- ✅ Repository pattern for DB abstraction

---

## Next Session Focus

**Start here:** Day 1 - Create LibSQL client factory and database setup script

**Command to run:**

```bash
cd packages/drizzle-schema
# Create client.ts and migrate.ts
# Test database initialization
```

LET'S MAKE IT RAIN! 🌧️💪
