# Schema Strategy: Hybrid Materialization

**Date:** Oct 5, 2025
**Status:** Implemented in drizzle-schema v0.1.0

---

## Philosophy

**Hybrid approach:** Materialize what we query by, JSON-ify what we don't.

### ✅ Materialize (as columns):

- **Identity:** Primary keys, foreign keys
- **Filters:** status, agent, board_id
- **Joins:** Genealogy (parent_session_id, forked_from_session_id)
- **Lookups:** slug, name
- **Indexes:** All materialized columns get indexes

### 📦 JSON Blob (in `data` column):

- **Nested objects:** git_state, repo config, message_range
- **Arrays:** concepts[], tasks[], children[], worktrees[]
- **Rarely queried:** description, agent_version, color, icon
- **Metadata:** tool_use_count, message_count

---

## Cross-Database Compatibility

**Works in both LibSQL (V1) and PostgreSQL (V2):**

### ❌ **Avoid** (SQLite-specific):

```sql
-- BAD: SQLite only
json_extract(data, '$.genealogy.parent_session_id')
```

### ✅ **Use** (Cross-DB):

```typescript
// GOOD: Materialized column
.where(eq(sessions.parent_session_id, parentId))

// GOOD: Drizzle's json() type (cross-DB)
.select({ concepts: sessions.data.concepts })
```

---

## Schema Examples

### Sessions Table

**Materialized columns:**

```typescript
{
  session_id: text('session_id').primaryKey(),
  status: text('status', { enum: [...] }),
  agent: text('agent', { enum: [...] }),
  board_id: text('board_id'),
  parent_session_id: text('parent_session_id'),
  forked_from_session_id: text('forked_from_session_id'),
  created_at: integer('created_at'),
  updated_at: integer('updated_at'),
}
```

**JSON blob:**

```typescript
data: json('data').$type<{
  agent_version?: string;
  description?: string;
  repo?: { ... };
  git_state: { ... };
  genealogy: { fork_point_task_id, spawn_point_task_id, children[] };
  concepts: string[];
  tasks: string[];
  message_count: number;
  tool_use_count: number;
}>()
```

### Boards Table

**Materialized:**

- `board_id`, `name`, `slug`

**JSON:**

- `description`, `sessions[]`, `color`, `icon`

### Tasks Table

**Materialized:**

- `task_id`, `session_id`, `status`, `created_at`, `completed_at`

**JSON:**

- `description`, `full_prompt`, `message_range`, `git_state`, `model`, `tool_use_count`, `report`

---

## Indexes Strategy

### Primary Indexes:

- All primary keys (B-tree automatic)
- All foreign keys (session_id, board_id, parent_session_id, etc.)

### Query Indexes:

```typescript
index('sessions_status_idx').on(status),
index('sessions_agent_idx').on(agent),
index('sessions_board_idx').on(board_id),
index('sessions_parent_idx').on(parent_session_id),
index('sessions_forked_idx').on(forked_from_session_id),
index('sessions_created_idx').on(created_at),
```

### Short ID Lookup:

- Uses primary key index (LIKE 'prefix%')
- No additional index needed (B-tree prefix matching)

---

## Query Patterns

### ✅ Fast (uses materialized columns):

```typescript
// Filter by status
.where(eq(sessions.status, 'running'))

// Filter by board
.where(eq(sessions.board_id, boardId))

// Genealogy tree queries
.where(eq(sessions.parent_session_id, sessionId))

// Multi-filter
.where(and(
  eq(sessions.agent, 'claude-code'),
  eq(sessions.status, 'running'),
  eq(sessions.board_id, boardId)
))
```

### ✅ Still works (JSON access):

```typescript
// Access nested JSON (Drizzle handles cross-DB)
.select({
  concepts: sessions.data.concepts,
  gitRef: sessions.data.git_state.ref,
})
```

### ❌ Avoid (requires JSON filtering):

```typescript
// Can't efficiently filter by JSON nested fields
.where(eq(sessions.data.git_state.ref, 'main')) // NO INDEX!

// If this becomes common, materialize git_ref as column
```

---

## Migration Strategy

### V1 → V2 (LibSQL → PostgreSQL):

**No schema changes needed!** 🎉

1. **Change driver:**

   ```typescript
   // V1
   import { drizzle } from 'drizzle-orm/libsql';

   // V2
   import { drizzle } from 'drizzle-orm/postgres-js';
   ```

2. **Data type mapping:**
   - `text()` → `text()`
   - `integer()` → `bigint()` or `integer()`
   - `json()` → `jsonb()` (PostgreSQL native)

3. **Indexes preserved:**
   - All indexes work identically
   - PostgreSQL has better JSON indexing (GIN indexes if needed)

---

## When to Add Materialized Columns

**Add a column when:**

- ✅ You filter by this field frequently (>10% of queries)
- ✅ You join on this field
- ✅ You sort by this field
- ✅ Query performance matters for this field

**Keep in JSON when:**

- ❌ Rarely queried (e.g., agent_version)
- ❌ Display-only data (e.g., description, color)
- ❌ Nested objects (e.g., git_state, repo config)
- ❌ Arrays (e.g., concepts, tasks) - unless you need array containment queries

---

## Performance Benchmarks (Target)

**With current schema:**

- Insert session: < 10ms ✅
- Query by status: < 5ms (indexed) ✅
- Genealogy tree (10 levels): < 50ms ✅
- Short ID lookup: < 5ms (B-tree prefix) ✅
- JSON field access: < 10ms ✅

**PostgreSQL improvements (V2):**

- GIN indexes on JSON arrays (concepts, tasks)
- Parallel query execution
- Better JSON operators (`@>`, `?`, `?&`)

---

## Decision Log

**Materialized Columns Added:**

1. `sessions.agent` - Filter by agent frequently
2. `sessions.board_id` - Board filtering is core UX
3. `sessions.parent_session_id` - Genealogy tree queries
4. `sessions.forked_from_session_id` - Genealogy tree queries
5. `boards.name` - Board lookup by name
6. `boards.slug` - Board lookup by slug

**Kept in JSON:**

1. `git_state` - Nested object, display-only
2. `repo` config - Nested object, not filtered
3. `concepts[]` - Array, displayed not filtered (V1)
4. `tasks[]` - Array, just IDs (real data in tasks table)
5. `genealogy.children[]` - Array, computed from parent queries

**Future Considerations:**

- If concept filtering becomes common → add `concepts` array column (PostgreSQL array type or separate table)
- If git ref filtering needed → materialize `git_ref` column

---

**See:**

- `packages/drizzle-schema/src/schema.ts` - Schema implementation
- `context/explorations/state-management.md` - Original architecture decisions
