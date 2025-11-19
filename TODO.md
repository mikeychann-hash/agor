# Agor - Prioritized Action Items

**Generated**: November 18, 2025
**Source**: Comprehensive Codebase Review (5 Specialized Agents)
**Total Issues**: 69 items

---

## Legend

- **Priority**: P0 (Critical) → P1 (High) → P2 (Medium) → P3 (Low)
- **Effort**: S (Small: <4 hours) | M (Medium: 1-3 days) | L (Large: 1-2 weeks)
- **Domain**: Backend | Frontend | BuildOps | Integration | Consistency

---

## 🔴 P0 - Critical (3 issues) - **IMMEDIATE ACTION REQUIRED**

### P0-1: Security - Multi-User Resource Isolation

**Domain**: Integration
**Impact**: Any authenticated user can access/modify/delete all data in shared environments
**Effort**: L (1-2 weeks)

**Issue**: No RBAC system - users can access each other's sessions, tasks, worktrees, API keys

**Actions**:
- [ ] Add resource ownership checks to service hooks
- [ ] Implement per-user API key encryption
- [ ] Add rate limiting per user
- [ ] Create scoped Unix user for daemon process
- [ ] Document deployment restrictions (trusted networks only) until implemented

**Files**:
- `/context/concepts/auth.md:8-35` (document current limitations)
- `/apps/agor-daemon/src/services/*.ts` (add ownership checks)

---

### P0-2: Frontend - No Error Boundaries

**Domain**: Frontend
**Impact**: Unhandled errors crash entire application (poor UX, data loss)
**Effort**: M (1-2 days)

**Issue**: No React error boundary implementation anywhere in the codebase

**Actions**:
- [ ] Create `ErrorBoundary` component
- [ ] Wrap App.tsx with error boundary
- [ ] Add error reporting (Sentry integration)
- [ ] Add error recovery UI (reload button, reset state)
- [ ] Test error scenarios (API failures, invalid data)

**Implementation**:
```tsx
// Create: /apps/agor-ui/src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
    // TODO: Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorRecoveryUI error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

**Files**:
- Create: `/apps/agor-ui/src/components/ErrorBoundary.tsx`
- Update: `/apps/agor-ui/src/App.tsx` (wrap with ErrorBoundary)

---

### P0-3: Frontend - Severe Accessibility Violations

**Domain**: Frontend
**Impact**: Application unusable for users with disabilities, WCAG 2.1 violations, legal risk
**Effort**: L (1-2 weeks)

**Issue**: Minimal ARIA attributes, no keyboard navigation, missing focus management

**Actions**:
- [ ] Add keyboard navigation to SessionCanvas
- [ ] Add ARIA labels to all interactive elements
- [ ] Implement focus trap in modals/drawers
- [ ] Add skip links for main content
- [ ] Validate color contrast (WCAG 2.1 AA)
- [ ] Add ARIA live regions for status updates
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Add accessibility tests (axe-core)

**Specific Fixes**:
```tsx
// SessionCanvas - add keyboard navigation
<ReactFlow
  onKeyDown={(e) => {
    if (e.key === 'Tab') {
      // Implement tab navigation through nodes
    }
  }}
  ariaLabel="Session workflow canvas"
  role="application"
/>

// Modals - add focus management
<Modal
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  autoFocus={true}
>
```

**Files**:
- Update: `/apps/agor-ui/src/components/SessionCanvas/SessionCanvas.tsx`
- Update: All modal components
- Update: All drawer components
- Create: `/apps/agor-ui/src/hooks/useFocusTrap.ts`
- Create: `/apps/agor-ui/src/utils/accessibility.ts`

---

## 🟡 P1 - High Priority (25 issues) - **Address This Sprint**

### Backend

#### P1-1: Large Main Entry Point (3,171 LOC)

**Effort**: L | **File**: `/apps/agor-daemon/src/index.ts`

**Actions**:
- [ ] Split into modules: `config/cors.ts`, `config/socketio.ts`, `config/auth.ts`
- [ ] Extract middleware: `middleware/rate-limit.ts`, `middleware/validation.ts`
- [ ] Create app factory: `app.ts` (<200 LOC)
- [ ] Keep index.ts as thin entry point

---

#### P1-2: N+1 Query in Genealogy Lookups

**Effort**: M | **File**: `/packages/core/src/db/repositories/sessions.ts:296-333`

**Actions**:
- [ ] Implement recursive CTE for tree traversal
- [ ] Add database migration
- [ ] Test performance with deep session trees
- [ ] Update repository tests

**Implementation**:
```sql
WITH RECURSIVE genealogy AS (
  SELECT * FROM sessions WHERE session_id = ?
  UNION ALL
  SELECT s.* FROM sessions s
  JOIN genealogy g ON s.parent_session_id = g.session_id
) SELECT * FROM genealogy;
```

---

#### P1-3: SQL Injection Risk in Tasks Repository

**Effort**: S | **File**: `/packages/core/src/db/repositories/tasks.ts:164`

**Actions**:
- [ ] Replace `sql.raw()` with Drizzle's `inArray()` helper
- [ ] Review all uses of `sql.raw()` in codebase
- [ ] Add linting rule to prevent future raw SQL

**Fix**:
```typescript
// BEFORE (vulnerable):
.where(sql`${tasks.task_id} IN ${sql.raw(`(${taskIds.map(id => `'${id}'`).join(',')})`)}`);

// AFTER (safe):
.where(inArray(tasks.task_id, taskIds))
```

---

#### P1-4: Rate Limiting Only on Auth Endpoints

**Effort**: S | **File**: `/apps/agor-daemon/src/index.ts:1330-1370`

**Actions**:
- [ ] Install `express-rate-limit`
- [ ] Add global rate limiter middleware
- [ ] Configure per-endpoint limits
- [ ] Add rate limit headers (X-RateLimit-*)

**Implementation**:
```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
```

---

#### P1-5: Master Secret Falls Back to Plaintext

**Effort**: S | **File**: `/packages/core/src/db/encryption.ts:12-24`

**Actions**:
- [ ] Fail hard in production if AGOR_MASTER_SECRET missing
- [ ] Add startup validation check
- [ ] Document in .env.example

**Fix**:
```typescript
if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error('AGOR_MASTER_SECRET required in production');
}
```

---

#### P1-6: Missing TODOs in Production Code

**Effort**: M | **Files**: Multiple

**Critical TODOs**:
1. [ ] `/apps/agor-daemon/src/mcp/tokens.ts:20` - Move MCP tokens to database (P0)
2. [ ] `/apps/agor-daemon/src/services/worktrees.ts:445,473` - Board object positioning
3. [ ] `/packages/core/src/tools/opencode/opencode-tool.ts:309` - OpenCode message fetching
4. [ ] `/apps/agor-daemon/src/services/scheduler.ts:304` - Attach MCP servers in scheduler

**Actions**:
- [ ] Create GitHub issues for all TODOs
- [ ] Assign owners and deadlines
- [ ] Complete or remove from codebase

---

### Frontend

#### P1-7: Massive Components Violate SRP

**Effort**: L | **Files**: Multiple

**Components to Refactor**:

1. **SessionCanvas.tsx** (2,105 LOC)
   - [ ] Extract `useCanvasNodes` hook
   - [ ] Extract `useCanvasDragDrop` hook
   - [ ] Extract `useCanvasZones` hook
   - [ ] Extract `CanvasControls` component
   - [ ] Extract `CanvasCommentLayer` component

2. **EnvironmentTab.tsx** (1,173 LOC)
   - [ ] Extract `EnvironmentStatus` component
   - [ ] Extract `EnvironmentLogs` component
   - [ ] Extract `ScheduleEditor` component
   - [ ] Create `useEnvironmentState` hook

3. **App.tsx** (1,129 LOC)
   - [ ] Extract `useSessionHandlers` hook
   - [ ] Extract `useUserHandlers` hook
   - [ ] Extract `useBoardHandlers` hook
   - [ ] Extract `useRepoHandlers` hook
   - [ ] Extract `useWorktreeHandlers` hook

4. **SessionDrawer.tsx** (1,019 LOC)
   - [ ] Extract `useSessionDrafts` hook
   - [ ] Extract `SessionHeader` component
   - [ ] Extract `SessionInput` component
   - [ ] Extract `SessionActions` component

---

#### P1-8: Minimal React.memo Usage (Only 5 instances)

**Effort**: M | **Files**: Multiple

**Actions**:
- [ ] Add React.memo to `WorktreeCard` (710 LOC)
- [ ] Add React.memo to `SessionCard` (331 LOC)
- [ ] Add React.memo to `MessageBlock` (508 LOC)
- [ ] Add React.memo to `TaskBlock` (681 LOC)
- [ ] Add React.memo to `CommentItem`
- [ ] Add custom comparison functions where needed

**Implementation**:
```tsx
export const WorktreeCard = React.memo<WorktreeCardProps>(
  ({ worktree, sessions, ... }) => {
    // Component logic
  },
  (prevProps, nextProps) => {
    // Custom comparison - only re-render if data changed
    return (
      prevProps.worktree.worktree_id === nextProps.worktree.worktree_id &&
      prevProps.worktree.updated_at === nextProps.worktree.updated_at &&
      prevProps.sessions.length === nextProps.sessions.length
    );
  }
);
```

---

#### P1-9: Missing Code Splitting / Lazy Loading

**Effort**: M | **Files**: Multiple

**Actions**:
- [ ] Add route-level code splitting (MobileApp, AgorApp)
- [ ] Lazy load heavy modals (SettingsModal, WorktreeModal, TerminalModal)
- [ ] Add Suspense boundaries with loading states
- [ ] Measure bundle size reduction

**Implementation**:
```tsx
const MobileApp = lazy(() => import('./components/mobile/MobileApp'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));

<Suspense fallback={<LoadingScreen />}>
  <Routes>
    <Route path="/m/*" element={<MobileApp ... />} />
  </Routes>
</Suspense>

{settingsOpen && (
  <Suspense fallback={<Spin />}>
    <SettingsModal ... />
  </Suspense>
)}
```

---

#### P1-10: TypeScript @ts-nocheck in Critical Hooks

**Effort**: M | **Files**: 3 hooks

**Actions**:
- [ ] Remove `@ts-nocheck` from `useAgorClient.ts`
- [ ] Remove `@ts-nocheck` from `useAgorData.ts`
- [ ] Remove `@ts-nocheck` from `useAuth.ts`
- [ ] Add proper type guards and null checks
- [ ] Fix type definitions where needed

---

#### P1-11: No Test Coverage (Only 1 Test File)

**Effort**: L | **Files**: Create new test files

**Priority Components/Hooks to Test**:
- [ ] `useAuth` hook (authentication flows)
- [ ] `useAgorData` hook (WebSocket sync)
- [ ] `SessionCanvas` (drag-drop, zone detection)
- [ ] `WorktreeCard` (environment states)
- [ ] `MessageBlock` (rendering different message types)
- [ ] API integration tests

**Setup**:
- [ ] Configure Vitest for component testing
- [ ] Set up React Testing Library
- [ ] Add coverage reporting to CI
- [ ] Target 80% coverage for critical paths

---

### BuildOps

#### P1-12: Incomplete .env.example

**Effort**: S | **File**: Create `/home/user/agor/.env.example`

**Actions**:
- [ ] Document all environment variables
- [ ] Include descriptions and defaults
- [ ] Add to repository root
- [ ] Reference in README.md

*See accompanying .env.example file*

---

#### P1-13: Turbo Cache Disabled for Typecheck

**Effort**: S | **File**: `/turbo.json`

**Actions**:
- [ ] Enable cache for typecheck task
- [ ] Add outputs configuration
- [ ] Test cache invalidation

**Fix**:
```json
{
  "typecheck": {
    "dependsOn": ["^build"],
    "outputs": [".tsbuildinfo", "node_modules/.tmp/**"]
  }
}
```

---

#### P1-14: Missing Source Maps in Production

**Effort**: S | **Files**: All `tsup.config.ts` and `vite.config.ts`

**Actions**:
- [ ] Add sourcemap config to all tsup builds
- [ ] Add sourcemap config to Vite build
- [ ] Test production error stack traces

---

#### P1-15: Docker Build Caching Issues

**Effort**: M | **Files**: `docker/Dockerfile.dev`, `docker/docker-entrypoint.sh`

**Actions**:
- [ ] Build @agor/core during Docker image build (not on start)
- [ ] Add layer caching for dependencies
- [ ] Optimize cache invalidation

---

#### P1-16: Missing Docker HEALTHCHECK

**Effort**: S | **File**: `docker/Dockerfile.prod`

**Actions**:
- [ ] Add HEALTHCHECK instruction
- [ ] Test health endpoint
- [ ] Document in deployment guide

**Implementation**:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:${DAEMON_PORT:-3030}/health || exit 1
```

---

### Integration

#### P1-17: WebSocket Auth Bypass

**Effort**: M | **File**: `/apps/agor-daemon/src/index.ts:451-475`

**Actions**:
- [ ] Only allow unauthenticated sockets if `allowAnonymous: true`
- [ ] Create separate `/auth` namespace for login flow
- [ ] Implement connection timeout for unauthenticated sockets (30s)

---

#### P1-18: Database Row Types ≠ Application Types

**Effort**: M | **File**: `/packages/core/src/db/schema.ts`

**Actions**:
- [ ] Create Drizzle schema helpers for auto-transformation
- [ ] Add runtime validation at repository boundary
- [ ] Generate TypeScript types from schema

---

#### P1-19: Inconsistent Pagination Defaults

**Effort**: S | **Files**: Multiple services

**Actions**:
- [ ] Standardize pagination: `{ default: 50, max: 1000 }`
- [ ] Update all service configurations
- [ ] Document in API guide

---

### Consistency

#### P1-20: Package Naming Inconsistency

**Effort**: S | **File**: `/apps/agor-ui/package.json`

**Actions**:
- [ ] Rename `agor-ui` to `@agor/ui`
- [ ] Update workspace references
- [ ] Update import paths
- [ ] Test build

---

#### P1-21: Version Number Misalignment

**Effort**: M | **Files**: All package.json files

**Actions**:
- [ ] Decide on versioning strategy (independent vs fixed)
- [ ] Align versions across packages
- [ ] Document versioning in CONTRIBUTING.md
- [ ] Consider using Changesets for version management

---

## 🟢 P2 - Medium Priority (20 issues) - **Address Next Sprint**

### Backend (10 issues)

#### P2-1: Service Coupling via Lazy Resolution

**Effort**: M | **File**: `/apps/agor-daemon/src/services/worktrees.ts:80-92`

**Actions**:
- [ ] Consider dependency injection pattern
- [ ] Or implement event-based decoupling
- [ ] Reduce circular dependencies

---

#### P2-2: Console Logging Instead of Structured Logging

**Effort**: M | **Files**: 88 occurrences across 11 files

**Actions**:
- [ ] Implement Winston or Pino
- [ ] Replace all console.log calls
- [ ] Add log levels (debug, info, warn, error)
- [ ] Configure log rotation

---

#### P2-3: No Connection Pooling

**Effort**: S | **File**: `/packages/core/src/db/client.ts`

**Actions**:
- [ ] Configure LibSQL connection pool
- [ ] Test under load
- [ ] Monitor connection usage

---

#### P2-4: JSON Extraction Instead of Indexed Columns

**Effort**: S | **File**: `/packages/core/src/db/repositories/sessions.ts:274-275`

**Actions**:
- [ ] Use materialized columns (parent_session_id, forked_from_session_id) instead of JSON extraction
- [ ] Update queries
- [ ] Measure performance improvement

**Fix**:
```typescript
// BEFORE (slow):
sql`json_extract(${sessions.data}, '$.genealogy.parent_session_id') = ${fullId}`

// AFTER (fast):
or(
  eq(sessions.parent_session_id, fullId),
  eq(sessions.forked_from_session_id, fullId)
)
```

---

#### P2-5: WebSocket Message Size Limit (1MB)

**Effort**: S | **File**: `/apps/agor-daemon/src/index.ts:439`

**Actions**:
- [ ] Increase to 10MB to match JSON body limit
- [ ] Or implement streaming for large responses
- [ ] Test with large code files

---

#### P2-6: Anonymous User ID Hardcoded

**Effort**: S | **File**: `/apps/agor-daemon/src/services/worktrees.ts:261`

**Actions**:
- [ ] Extract user context from authentication
- [ ] Remove hardcoded 'anonymous' string
- [ ] Update audit trails

---

#### P2-7: Potential Memory Leak - Interval Not Cleared

**Effort**: S | **File**: `/apps/agor-daemon/src/index.ts:572-580`

**Actions**:
- [ ] Use proper shutdown handler (SIGTERM, SIGINT)
- [ ] Clear intervals on shutdown
- [ ] Test graceful shutdown

---

#### P2-8: No Pagination Enforcement

**Effort**: S | **Files**: All services

**Actions**:
- [ ] Enforce reasonable max pagination (e.g., 500)
- [ ] Add query validation
- [ ] Document limits

---

#### P2-9: Error Swallowing in Try-Catch Blocks

**Effort**: M | **Files**: worktrees.ts, repos.ts, scheduler.ts

**Actions**:
- [ ] Review all try-catch blocks
- [ ] Decide: throw or return Result type
- [ ] Add proper error logging

---

#### P2-10: Type Assertions Instead of Narrowing

**Effort**: M | **Files**: Multiple services

**Actions**:
- [ ] Replace `as` type assertions with proper type guards
- [ ] Add runtime checks where needed
- [ ] Fix return types

---

### Frontend (10 issues)

#### P2-11: Excessive useState Calls (265 instances)

**Effort**: M | **Files**: Multiple components

**Actions**:
- [ ] Use reducer pattern for related state (SessionDrawer, WorktreeCard)
- [ ] Identify derived state that shouldn't be stored
- [ ] Refactor top 5 components with most useState calls

---

#### P2-12: Missing useCallback for Event Handlers

**Effort**: M | **Files**: Many components

**Actions**:
- [ ] Wrap event handlers in useCallback (SessionCanvas)
- [ ] Add dependencies correctly
- [ ] Test re-render reduction

---

#### P2-13: Pill.tsx - 851 LOC for Badge Components

**Effort**: S | **File**: `/apps/agor-ui/src/components/Pill/Pill.tsx`

**Actions**:
- [ ] Split into: BasePill, StatusPills, MetadataPills, GitPills, ContextPills
- [ ] Update imports
- [ ] Test all pill variants

---

#### P2-14: Missing Loading States

**Effort**: S | **Files**: Multiple components

**Actions**:
- [ ] Add loading indicators to all async operations
- [ ] Use Ant Design message.loading() consistently
- [ ] Add skeleton screens for data fetching

---

#### P2-15: Hardcoded Magic Numbers/Strings

**Effort**: S | **Files**: useAgorData.ts, SessionDrawer.tsx, etc.

**Actions**:
- [ ] Extract to constants file
- [ ] Use const assertions
- [ ] Document magic values

**Example**:
```typescript
const QUERY_LIMITS = {
  SESSIONS: 1000,
  TASKS: 500,
  COMMENTS: 500,
} as const;
```

---

#### P2-16: Inconsistent Key Props in Lists

**Effort**: S | **Files**: Multiple components

**Actions**:
- [ ] Audit all .map() calls
- [ ] Ensure stable keys (IDs, not indexes)
- [ ] Add linting rule

---

#### P2-17: Console Logs in Production Code

**Effort**: S | **Files**: useAuth.ts, useAgorClient.ts, App.tsx

**Actions**:
- [ ] Use debug library or build-time removal
- [ ] Configure Vite terser to drop console.log
- [ ] Keep console.error for critical errors

---

#### P2-18: CSS Files Mixed with Components

**Effort**: S | **Files**: SessionCanvas.css, AutocompleteTextarea.css, Facepile.css

**Actions**:
- [ ] Migrate to CSS-in-JS (emotion) OR CSS modules
- [ ] Standardize styling approach
- [ ] Update Storybook configuration

---

#### P2-19: Storybook Underutilized

**Effort**: M | **File**: Only 1 story exists

**Actions**:
- [ ] Add stories for all Pill variants
- [ ] Add stories for WorktreeCard states
- [ ] Add stories for Modal components
- [ ] Set up visual regression testing

---

#### P2-20: Mobile App Separation Concerns

**Effort**: S | **File**: `/apps/agor-ui/src/components/mobile/MobileApp.tsx`

**Actions**:
- [ ] Document mobile/desktop routing
- [ ] Add user preference override ("View desktop site")
- [ ] Test SEO impact
- [ ] Consider server-side detection for SSR

---

## 🔵 P3 - Low Priority (21 issues) - **Future Improvements**

### Backend

- [ ] P3-1: Implement structured logging (Winston/Pino)
- [ ] P3-2: Cascading session deletes optimization (database CASCADE)
- [ ] P3-3: Environment variable allowlist approach
- [ ] P3-4: Dependency version strategy (exact vs caret)
- [ ] P3-5: Magic numbers extraction to constants
- [ ] P3-6: Remove commented code
- [ ] P3-7: Git credential injection in URL (use helper only)

### Frontend

- [ ] P3-8: Bundle size analysis (rollup-plugin-visualizer)
- [ ] P3-9: Add virtualization for long lists (react-window)
- [ ] P3-10: Missing skip links for accessibility
- [ ] P3-11: Color contrast validation (WCAG 2.1)
- [ ] P3-12: ARIA live regions for status updates

### BuildOps

- [ ] P3-13: Add pre-push hook (run tests)
- [ ] P3-14: Configure Renovate/Dependabot
- [ ] P3-15: Enable npm provenance for agor-live
- [ ] P3-16: Add Lighthouse CI for performance tracking
- [ ] P3-17: Create docker-compose.override.yml
- [ ] P3-18: Redundant Prettier config (choose Biome OR Prettier)
- [ ] P3-19: Add bundle size warnings/limits
- [ ] P3-20: Docker prod image uses @latest tags (pin versions)
- [ ] P3-21: Missing CI cache enhancements (pnpm store)

---

## Quick Wins (S effort, high impact)

**Can complete in <1 day:**

1. ✅ P1-3: Fix SQL injection (use inArray())
2. ✅ P1-4: Add rate limiting middleware
3. ✅ P1-5: Master secret validation
4. ✅ P1-12: Create .env.example
5. ✅ P1-13: Enable Turbo cache for typecheck
6. ✅ P1-14: Add source maps
7. ✅ P1-16: Add Docker HEALTHCHECK
8. ✅ P1-19: Standardize pagination
9. ✅ P1-20: Rename agor-ui package
10. ✅ P2-4: Use indexed columns (not JSON extraction)

**Estimated total: 8-10 hours for 10 quick wins**

---

## Sprint Planning Recommendations

### Sprint 1 (Week 1-2): Critical Fixes + Quick Wins

**Focus**: P0 issues + high-impact quick wins

**Tasks**:
- [ ] P0-2: Add error boundaries (M)
- [ ] P0-3: Start accessibility fixes (keyboard nav, ARIA labels) (L - Phase 1)
- [ ] P1-3: Fix SQL injection (S - Quick win)
- [ ] P1-4: Add rate limiting (S - Quick win)
- [ ] P1-12: Create .env.example (S - Quick win)
- [ ] P1-13: Enable Turbo cache (S - Quick win)
- [ ] P1-20: Rename package (S - Quick win)

**Estimated Effort**: 1.5-2 weeks

---

### Sprint 2 (Week 3-4): Performance Optimization

**Focus**: Frontend performance + backend query optimization

**Tasks**:
- [ ] P1-8: Add React.memo to top components (M)
- [ ] P1-9: Implement code splitting (M)
- [ ] P1-2: Optimize genealogy queries (M)
- [ ] P2-4: Use indexed columns (S)
- [ ] P2-11: Refactor useState to reducers (M)

**Estimated Effort**: 1.5-2 weeks

---

### Sprint 3 (Week 5-6): Component Refactoring

**Focus**: Break down large components

**Tasks**:
- [ ] P1-7: Refactor SessionCanvas.tsx (L)
- [ ] P1-7: Refactor App.tsx (L)
- [ ] P1-7: Refactor EnvironmentTab.tsx (M)
- [ ] P1-7: Refactor SessionDrawer.tsx (M)

**Estimated Effort**: 2 weeks

---

### Sprint 4 (Week 7-8): Testing & Documentation

**Focus**: Test coverage + documentation

**Tasks**:
- [ ] P1-11: Add integration tests (L)
- [ ] P1-11: Add component tests (M)
- [ ] P1-6: Resolve all TODOs (M)
- [ ] Create package READMEs (M)
- [ ] Add database schema docs (M)

**Estimated Effort**: 2 weeks

---

### Sprint 5+ (Week 9+): Multi-tenancy & Polish

**Focus**: RBAC, remaining P2/P3 issues

**Tasks**:
- [ ] P0-1: Implement RBAC system (L)
- [ ] P0-3: Complete accessibility audit (L)
- [ ] P2 issues (various)
- [ ] P3 issues (nice-to-haves)

**Estimated Effort**: 4-6 weeks

---

## Issue Tracker Template

**Use this template when creating GitHub issues:**

```markdown
## [P0/P1/P2/P3] {Issue Title}

**Domain**: Backend | Frontend | BuildOps | Integration | Consistency
**Effort**: S | M | L
**Impact**: {Description of business/technical impact}

### Problem
{Clear description of the issue}

### Current State
{Code snippets or file references}

### Recommended Fix
{Specific actions or code changes}

### Files Affected
- [ ] /path/to/file1.ts
- [ ] /path/to/file2.tsx

### Acceptance Criteria
- [ ] {Criteria 1}
- [ ] {Criteria 2}
- [ ] Tests added/updated
- [ ] Documentation updated

### Related Issues
{Links to related issues}

### References
- Review Report Section: {Section link}
- Agent Report: {CodeAudit | UI/UX | BuildOps | Integration | Consistency}
```

---

## Progress Tracking

**Use this section to track completion:**

### P0 Progress: 0/3 (0%)
- [ ] P0-1: Multi-user resource isolation
- [ ] P0-2: Error boundaries
- [ ] P0-3: Accessibility violations

### P1 Progress: 0/25 (0%)
- [ ] Backend: 0/6
- [ ] Frontend: 0/5
- [ ] BuildOps: 0/5
- [ ] Integration: 0/3
- [ ] Consistency: 0/2

### P2 Progress: 0/20 (0%)
- [ ] Backend: 0/10
- [ ] Frontend: 0/10

### P3 Progress: 0/21 (0%)
- [ ] Various: 0/21

### Overall Progress: 0/69 (0%)

**Target Dates**:
- P0 completion: {Date}
- P1 completion: {Date}
- P2 completion: {Date}
- P3 completion: {Date}

---

**Last Updated**: November 18, 2025
**Next Review**: {Schedule follow-up in 6 months}
