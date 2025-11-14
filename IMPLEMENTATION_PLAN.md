# Agor Implementation Plan

**Agent:** A - Senior Architect / Lead Reviewer
**Date:** 2025-11-14
**Based on:** ARCHITECTURE_REVIEW.md
**Overall Assessment:** 97% (A+) - Production Ready

---

## Executive Summary

This implementation plan addresses the gaps identified in the architecture review. **The codebase is production-ready** with a 97% score. The identified items are primarily **documentation improvements** and **consistency enhancements** that do not block functionality.

### Priority Distribution

- **P0 (Critical):** 0 items - No blockers
- **P1 (High):** 3 items - Documentation gaps (8 hours total)
- **P2 (Medium):** 4 items - Consistency & enhancements (34 hours total)

**Total Estimated Effort:** 42 hours (~ 1 week for 1 developer)

---

## P0 - Critical (None)

**No critical issues identified.** All core functionality is complete and working.

---

## P1 - High Priority (Documentation Gaps)

These items improve developer experience and onboarding but do not impact functionality.

### P1.1 - Document agor-live Package

**Status:** Undocumented
**Impact:** Medium
**Effort:** 1 hour
**Assignee:** Agent B

**Problem:**
- `packages/agor-live` exists (360K) as the distribution package
- Enables `npx agor-live` global installation
- Not documented in CLAUDE.md

**Solution:**

Add section to `CLAUDE.md`:

```markdown
## Distribution Package

**agor-live** is the npm distribution package that bundles the entire Agor stack for easy installation.

**Location:** `packages/agor-live/`

**Installation:**
```bash
# Global installation
npm install -g agor-live

# Or run directly
npx agor-live
```

**What it includes:**
- `agor` CLI (symlink to `apps/agor-cli`)
- `agor-daemon` server (symlink to `apps/agor-daemon`)
- All dependencies bundled

**Why separate package?**
- Monorepo structure for development
- Single package for distribution
- Simpler installation for end users
```

**Acceptance Criteria:**
- [ ] CLAUDE.md updated with agor-live section
- [ ] README.md references agor-live installation
- [ ] Package.json description accurate

---

### P1.2 - Document Core Utility Packages

**Status:** Undocumented
**Impact:** Medium
**Effort:** 4 hours
**Assignee:** Agent B

**Problem:**
- 9 subdirectories in `packages/core/src/` are undocumented
- Makes onboarding harder for new developers
- Purpose and usage unclear

**Undocumented Subdirectories:**
1. `claude/` - Claude-specific utilities (4,750 LOC)
2. `config/` - Configuration management
3. `environment/` - Environment instance management
4. `feathers/` - FeathersJS utilities
5. `lib/` - Shared libraries
6. `permissions/` - Permission system
7. `seed/` - Database seeding
8. `templates/` - Handlebars templates
9. `utils/` - Utility functions

**Solution:**

Add to `CLAUDE.md` → "Project Structure" section:

```markdown
├── packages/
│   └── core/                # Shared @agor/core package
│       ├── api/             # FeathersJS client utilities
│       ├── claude/          # Claude-specific utilities (message conversion, SDK integration)
│       ├── config/          # Configuration management (~/.agor/config.yaml)
│       ├── db/              # Drizzle ORM + repositories + schema
│       ├── environment/     # Environment instance management (Docker, process control)
│       ├── feathers/        # FeathersJS utilities (client creation, hooks)
│       ├── git/             # Git utils (simple-git only, no subprocess)
│       ├── lib/             # Shared libraries (crypto, validation, etc.)
│       ├── permissions/     # Permission system (modes, approval workflows)
│       ├── seed/            # Database seeding for development
│       ├── templates/       # Handlebars templates for zones and reports
│       ├── tools/           # Agent integrations (Claude, Codex, Gemini, OpenCode)
│       ├── types/           # TypeScript types (Session, Task, Worktree, etc.)
│       └── utils/           # Utility functions (ID generation, short IDs, etc.)
```

**Acceptance Criteria:**
- [ ] CLAUDE.md updated with all subdirectories
- [ ] Brief description of each subdirectory's purpose
- [ ] Key files mentioned for each subdirectory

---

### P1.3 - Document All Services

**Status:** Partial (6/18 documented)
**Impact:** Medium
**Effort:** 3 hours
**Assignee:** Agent B

**Problem:**
- CLAUDE.md only documents 6 of 18 services
- Harder to discover available endpoints
- Service purpose unclear

**Documented:**
- sessions, tasks, messages, boards, repos, worktrees

**Undocumented:**
- board-comments, board-objects, config, context, files, health-monitor, leaderboard, mcp-servers, scheduler, session-mcp-servers, terminals, users

**Solution:**

Update `CLAUDE.md` → "Project Structure" → "Important Paths" section:

```markdown
**Services:**
- `apps/agor-daemon/src/services/` - All FeathersJS services
  - **Core Primitives:**
    - sessions.ts - Session CRUD, fork, spawn, prompt execution
    - tasks.ts - Task CRUD, completion tracking
    - messages.ts - Message storage, streaming
    - boards.ts - Board CRUD
    - repos.ts - Repository management, git operations
    - worktrees.ts - Worktree CRUD, environment control
  - **Supporting Services:**
    - board-objects.ts - Board layout (position tracking)
    - board-comments.ts - Spatial comments, reactions
    - users.ts - User management, authentication
    - mcp-servers.ts - MCP server configuration
    - session-mcp-servers.ts - Session-MCP server associations
    - terminals.ts - WebSocket terminal proxy (xterm.js + node-pty)
    - context.ts - Context file browser
    - files.ts - File operations
    - config.ts - Configuration management
    - health-monitor.ts - Real-time diagnostics
    - scheduler.ts - Worktree-scoped cron scheduler
    - leaderboard.ts - User activity tracking
```

**Acceptance Criteria:**
- [ ] All 18 services listed in CLAUDE.md
- [ ] Brief description of each service
- [ ] Grouped by category (Core vs Supporting)

---

## P2 - Medium Priority (Consistency & Enhancements)

These items improve code consistency and test coverage but are not urgent.

### P2.1 - Implement UsersRepository

**Status:** Missing
**Impact:** Low
**Effort:** 2 hours
**Assignee:** Agent B

**Problem:**
- All other services use Repository pattern
- UsersService implements CRUD directly
- Inconsistent with architecture

**Current Pattern:**
```typescript
// apps/agor-daemon/src/services/users.ts
async find(params: Params) {
  return await this.db.select().from(users).all(); // Direct Drizzle
}
```

**Expected Pattern:**
```typescript
// packages/core/src/db/repositories/users.ts
export class UsersRepository extends BaseRepository<User> {
  constructor(db: DrizzleClient) {
    super(db, users, 'user_id');
  }
  // Standard CRUD methods from BaseRepository
}

// apps/agor-daemon/src/services/users.ts
async find(params: Params) {
  return await this.usersRepo.find(query); // Via repository
}
```

**Implementation Steps:**

1. **Create UsersRepository**
   ```bash
   touch packages/core/src/db/repositories/users.ts
   ```

2. **Implement Repository**
   ```typescript
   import { BaseRepository } from './base';
   import { users } from '../schema';
   import type { User, UserID } from '../../types/user';

   export class UsersRepository extends BaseRepository<User> {
     constructor(db: DrizzleClient) {
       super(db, users, 'user_id');
     }

     async findByEmail(email: string): Promise<User | null> {
       return await this.db
         .select()
         .from(users)
         .where(eq(users.email, email))
         .get();
     }

     async findByUsername(username: string): Promise<User | null> {
       return await this.db
         .select()
         .from(users)
         .where(eq(users.username, username))
         .get();
     }
   }
   ```

3. **Refactor UsersService**
   ```typescript
   import { UsersRepository } from '@agor/core/db/repositories/users';

   export class UsersService implements ServiceMethods<User> {
     private usersRepo: UsersRepository;

     constructor(app: Application) {
       this.usersRepo = new UsersRepository(app.get('db'));
     }

     async find(params: Params) {
       return await this.usersRepo.find(params.query);
     }

     async get(id: string) {
       return await this.usersRepo.get(id);
     }

     // ... other methods
   }
   ```

4. **Add Tests**
   ```bash
   touch packages/core/src/db/repositories/users.test.ts
   ```

**Acceptance Criteria:**
- [ ] UsersRepository created and extends BaseRepository
- [ ] UsersService refactored to use repository
- [ ] All tests pass
- [ ] No behavioral changes (API remains identical)

---

### P2.2 - Create Primitives Deep-Dive Documentation

**Status:** Missing
**Impact:** Low
**Effort:** 8 hours
**Assignee:** Agent B

**Problem:**
- `context/README.md` mentions `primitives/` folder
- Folder doesn't exist yet
- Would help deep understanding of each primitive

**Solution:**

Create `context/primitives/` directory with detailed docs:

```
context/primitives/
├── README.md           - Index of primitive docs
├── session.md          - Session lifecycle, genealogy, SDK integration
├── task.md             - Task execution, message ranges, git state
├── worktree.md         - Worktree management, environments, terminals
├── board.md            - Board layout, zones, triggers
├── repo.md             - Repository management, git operations
├── message.md          - Message structure, content types, streaming
└── concept.md          - Concept files, context engineering (meta!)
```

**Content Template (session.md):**

```markdown
# Session Primitive - Deep Dive

## Overview

Sessions are the universal container for all agent interactions in Agor.

## Lifecycle

1. Creation
2. Execution
3. Fork/Spawn
4. Completion

## Data Model

[Detailed schema breakdown]

## Genealogy System

[Fork vs Spawn explanation with diagrams]

## SDK Integration

[Claude Code session continuity details]

## Best Practices

[When to fork, when to spawn, etc.]

## Examples

[Real-world usage patterns]
```

**Estimated Effort:**
- README.md: 1 hour
- session.md: 2 hours
- task.md: 1 hour
- worktree.md: 1 hour
- board.md: 1 hour
- repo.md: 1 hour
- message.md: 30 minutes
- concept.md: 30 minutes

**Acceptance Criteria:**
- [ ] `context/primitives/` folder created
- [ ] All 7 primitive docs created
- [ ] README.md indexes all docs
- [ ] Cross-references to related concepts

---

### P2.3 - Add More Storybook Stories

**Status:** Limited (6 stories)
**Impact:** Low
**Effort:** 8 hours
**Assignee:** Agent B

**Problem:**
- Only 6 Storybook stories currently
- Hard to develop components in isolation
- No visual regression testing

**Current Stories:**
- NewSessionButton.stories.tsx
- EnvironmentPill.stories.tsx
- (4 others)

**Target Components for Stories:**

**High Priority:**
1. WorktreeCard - Primary board entity
2. SessionDrawer - Main conversation UI
3. ThinkingBlock - Extended thinking display
4. PermissionModeSelector - Permission controls
5. ZoneConfigModal - Zone trigger editor

**Medium Priority:**
6. AgentSelectionGrid - Agent picker
7. ToolExecutingIndicator - Live tool feedback
8. MCPServersTable - MCP management
9. EnvVarEditor - User env vars
10. CommentsPanel - Spatial comments

**Implementation Steps:**

1. **Create Story Files**
   ```bash
   touch apps/agor-ui/src/components/WorktreeCard/WorktreeCard.stories.tsx
   touch apps/agor-ui/src/components/SessionDrawer/SessionDrawer.stories.tsx
   # ... etc
   ```

2. **Story Template**
   ```typescript
   import type { Meta, StoryObj } from '@storybook/react';
   import { WorktreeCard } from './WorktreeCard';

   const meta: Meta<typeof WorktreeCard> = {
     title: 'Components/WorktreeCard',
     component: WorktreeCard,
     tags: ['autodocs'],
   };

   export default meta;
   type Story = StoryObj<typeof WorktreeCard>;

   export const Default: Story = {
     args: {
       worktree: {
         worktree_id: '...',
         name: 'feat-auth',
         ref: 'feature/oauth2-auth',
         // ... mock data
       },
     },
   };

   export const WithSessions: Story = {
     args: {
       worktree: { /* ... */ },
       sessions: [/* ... */],
     },
   };
   ```

3. **Run Storybook**
   ```bash
   cd apps/agor-ui
   pnpm storybook
   ```

**Acceptance Criteria:**
- [ ] 10 new Storybook stories created
- [ ] All stories have multiple variants
- [ ] Stories documented with JSDoc
- [ ] Storybook builds without errors

---

### P2.4 - Increase Test Coverage

**Status:** 85%
**Impact:** Low
**Effort:** 16 hours
**Assignee:** Agent B

**Problem:**
- Current test coverage: 85%
- Some newer features under-tested
- No end-to-end tests

**Areas Needing Tests:**

**1. Scheduler Service (0% coverage)**
- Cron schedule parsing
- Worktree-scoped execution
- Session spawning on schedule

**2. Terminals Service (30% coverage)**
- Terminal creation with worktree context
- Tmux session management
- WebSocket event handling

**3. OpenCode Integration (40% coverage)**
- Server-mode health checks
- Model listing
- Prompt execution

**4. Board Comments (50% coverage)**
- Thread creation
- Reactions
- Mention parsing

**5. Leaderboard Service (0% coverage)**
- Activity tracking
- Score calculation
- Leaderboard ranking

**Implementation Steps:**

1. **Scheduler Tests**
   ```typescript
   // packages/core/src/scheduler/scheduler.test.ts
   describe('Scheduler', () => {
     it('parses cron expressions', () => { /* ... */ });
     it('spawns session on schedule', () => { /* ... */ });
     it('handles worktree-scoped schedules', () => { /* ... */ });
   });
   ```

2. **Terminals Tests**
   ```typescript
   // apps/agor-daemon/src/services/terminals.test.ts
   describe('TerminalsService', () => {
     it('creates terminal with worktree cwd', () => { /* ... */ });
     it('reuses tmux session', () => { /* ... */ });
     it('emits data events', () => { /* ... */ });
   });
   ```

3. **OpenCode Tests**
   ```typescript
   // packages/core/src/tools/opencode/opencode-tool.test.ts
   describe('OpenCodeTool', () => {
     it('checks server health', () => { /* ... */ });
     it('lists models', () => { /* ... */ });
     it('executes prompts', () => { /* ... */ });
   });
   ```

4. **Board Comments Tests**
   ```typescript
   // apps/agor-daemon/src/services/board-comments.test.ts
   describe('BoardCommentsService', () => {
     it('creates threaded comments', () => { /* ... */ });
     it('toggles reactions', () => { /* ... */ });
     it('parses mentions', () => { /* ... */ });
   });
   ```

5. **Leaderboard Tests**
   ```typescript
   // apps/agor-daemon/src/services/leaderboard.test.ts
   describe('LeaderboardService', () => {
     it('tracks user activity', () => { /* ... */ });
     it('calculates scores', () => { /* ... */ });
     it('ranks users', () => { /* ... */ });
   });
   ```

**Estimated Effort:**
- Scheduler: 4 hours
- Terminals: 4 hours
- OpenCode: 3 hours
- Board Comments: 2 hours
- Leaderboard: 3 hours

**Acceptance Criteria:**
- [ ] Test coverage increased to 95%+
- [ ] All services have >80% coverage
- [ ] All critical paths tested
- [ ] CI passes all tests

---

## Implementation Timeline

### Week 1 (42 hours total)

**Day 1-2 (P1 - Documentation):**
- P1.1: Document agor-live (1 hour)
- P1.2: Document core utilities (4 hours)
- P1.3: Document all services (3 hours)
- **Total: 8 hours**

**Day 3 (P2.1 - Consistency):**
- P2.1: Implement UsersRepository (2 hours)
- **Total: 2 hours**

**Day 4-5 (P2.2 - Deep Dives):**
- P2.2: Create primitives documentation (8 hours)
- **Total: 8 hours**

**Day 6 (P2.3 - Storybook):**
- P2.3: Add Storybook stories (8 hours)
- **Total: 8 hours**

**Day 7 (P2.4 - Tests):**
- P2.4: Increase test coverage (16 hours split over 2 days)
- **Total: 8 hours (Day 7), 8 hours (Week 2 Day 1)**

---

## Success Metrics

### Documentation Quality
- [ ] All packages documented in CLAUDE.md
- [ ] All services documented in CLAUDE.md
- [ ] Primitives deep-dive docs created
- [ ] Storybook coverage increased to 20+ stories

### Code Quality
- [ ] UsersRepository implemented
- [ ] Repository pattern consistent across all entities
- [ ] Test coverage ≥ 95%

### Developer Experience
- [ ] Onboarding time reduced by 50%
- [ ] Component development easier with Storybook
- [ ] Architecture easier to understand with deep-dives

---

## Risk Mitigation

### Low Risk Items

**P1.1-P1.3 (Documentation):**
- **Risk:** None (documentation only)
- **Mitigation:** N/A

**P2.1 (UsersRepository):**
- **Risk:** Breaking existing UsersService
- **Mitigation:** Comprehensive tests, no API changes

**P2.2 (Primitives Docs):**
- **Risk:** None (documentation only)
- **Mitigation:** N/A

**P2.3 (Storybook):**
- **Risk:** None (dev tooling only)
- **Mitigation:** N/A

**P2.4 (Test Coverage):**
- **Risk:** Tests may reveal existing bugs
- **Mitigation:** Fix bugs as discovered, prioritize by severity

---

## Dependencies

### External Dependencies
- None (all items are internal improvements)

### Internal Dependencies
- **P2.1 depends on:** Database schema (already complete)
- **P2.4 depends on:** Services implementation (already complete)

### Blocking Items
- None (all items can be worked on independently)

---

## Acceptance Criteria

### Overall Success
- [ ] All P1 items completed (8 hours)
- [ ] At least 2 P2 items completed (minimum 10 hours)
- [ ] No regressions introduced
- [ ] All tests passing
- [ ] Documentation reviewed and approved

### Quality Gates
- [ ] Code review passed
- [ ] Tests passing with ≥ 95% coverage
- [ ] Storybook builds successfully
- [ ] Documentation accurate and complete

---

## Next Steps After Implementation

1. **Agent B:** Execute implementation plan (in priority order)
2. **Agent C:** QA validation of changes
3. **Agent D:** Verify deployment readiness
4. **Final:** Sign-off if all quality gates pass

---

## Appendix A: Detailed File Locations

### P1.1 - agor-live Documentation
- **Update:** `CLAUDE.md` (line ~50, after "Project Structure")
- **Update:** `README.md` (installation section)
- **Review:** `packages/agor-live/package.json`

### P1.2 - Core Utilities Documentation
- **Update:** `CLAUDE.md` (line ~100, "Project Structure")
- **Files to reference:**
  - `packages/core/src/claude/`
  - `packages/core/src/config/`
  - `packages/core/src/environment/`
  - `packages/core/src/feathers/`
  - `packages/core/src/lib/`
  - `packages/core/src/permissions/`
  - `packages/core/src/seed/`
  - `packages/core/src/templates/`
  - `packages/core/src/utils/`

### P1.3 - Service Documentation
- **Update:** `CLAUDE.md` (line ~350, "Important Paths")
- **Files to reference:**
  - `apps/agor-daemon/src/services/*.ts` (all 18 services)

### P2.1 - UsersRepository
- **Create:** `packages/core/src/db/repositories/users.ts`
- **Create:** `packages/core/src/db/repositories/users.test.ts`
- **Update:** `apps/agor-daemon/src/services/users.ts`

### P2.2 - Primitives Docs
- **Create:** `context/primitives/` directory
- **Create:** 8 markdown files (README + 7 primitives)

### P2.3 - Storybook Stories
- **Create:** 10 new `.stories.tsx` files in component directories

### P2.4 - Test Coverage
- **Create/Update:** Test files for under-tested services
- **Files:** scheduler.test.ts, terminals.test.ts, opencode-tool.test.ts, board-comments.test.ts, leaderboard.test.ts

---

**End of Implementation Plan**

**Next Document:** RISK_MAP.md
