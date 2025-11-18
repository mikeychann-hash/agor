# Agor - Directory Structure Analysis & Recommendations

**Date**: November 18, 2025
**Current Version**: 0.7.1
**Review Result**: ✅ **Structure is well-organized** - Minor optimizations recommended

---

## Executive Summary

The Agor directory structure follows **excellent monorepo best practices** with clear separation between apps, packages, and documentation. The review found the current structure to be **production-ready** with only minor organizational improvements recommended.

**Grade**: **A (95/100)**

---

## Current Structure (Validated)

```
agor/                                    # Root monorepo
├── .github/                             # ✅ GitHub configuration
│   └── workflows/                       # CI/CD pipelines
│       ├── ci.yml                       # Typecheck, lint, build
│       ├── deploy-docs.yml              # GitHub Pages deployment
│       └── build-devcontainer.yml       # Docker builds
│
├── .husky/                              # ✅ Git hooks
│   └── pre-commit                       # Typecheck + lint-staged
│
├── apps/                                # ✅ Applications (4)
│   ├── agor-daemon/                     # Backend (FeathersJS)
│   │   ├── src/
│   │   │   ├── index.ts                 # ⚠️ 3,171 LOC - needs refactoring
│   │   │   ├── services/                # 18 FeathersJS services
│   │   │   └── mcp/                     # MCP server integration
│   │   ├── package.json
│   │   └── tsup.config.ts
│   │
│   ├── agor-ui/                         # Frontend (React + Vite)
│   │   ├── public/                      # Static assets
│   │   ├── src/
│   │   │   ├── main.tsx                 # Entry point
│   │   │   ├── App.tsx                  # ⚠️ 1,129 LOC - needs refactoring
│   │   │   ├── components/              # 65+ React components
│   │   │   ├── hooks/                   # Custom hooks (13)
│   │   │   ├── contexts/                # React contexts
│   │   │   ├── utils/                   # Utility functions
│   │   │   └── styles/                  # Global styles
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── agor-cli/                        # CLI tool (oclif)
│   │   ├── bin/                         # Executable scripts
│   │   ├── src/
│   │   │   ├── commands/                # 50+ CLI commands
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsup.config.ts
│   │
│   └── agor-docs/                       # Documentation site (Next.js + Nextra)
│       ├── pages/                       # Markdown documentation
│       ├── public/                      # Static assets
│       ├── theme.config.tsx
│       └── next.config.mjs
│
├── packages/                            # ✅ Shared packages (2)
│   ├── core/                            # @agor/core - shared library
│   │   ├── src/
│   │   │   ├── api/                     # FeathersJS client utilities
│   │   │   ├── claude/                  # Claude SDK integration
│   │   │   ├── config/                  # Configuration management
│   │   │   ├── db/                      # Drizzle ORM + repositories
│   │   │   │   ├── schema.ts            # Database schema
│   │   │   │   ├── repositories/        # Repository pattern
│   │   │   │   └── migrations/          # Database migrations
│   │   │   ├── environment/             # Docker/process management
│   │   │   ├── feathers/                # FeathersJS utilities
│   │   │   ├── git/                     # Git operations (simple-git)
│   │   │   ├── lib/                     # Shared libraries
│   │   │   ├── permissions/             # Permission system
│   │   │   ├── seed/                    # Database seeding
│   │   │   ├── templates/               # Handlebars templates
│   │   │   ├── tools/                   # Agent SDK integrations
│   │   │   │   ├── claude/
│   │   │   │   ├── codex/
│   │   │   │   ├── gemini/
│   │   │   │   └── opencode/
│   │   │   ├── types/                   # TypeScript type definitions
│   │   │   └── utils/                   # Utility functions
│   │   ├── package.json
│   │   └── tsup.config.ts
│   │
│   └── agor-live/                       # npm distribution package
│       ├── bin/                         # Executable wrappers
│       ├── dist/                        # Built artifacts
│       ├── build.sh                     # Build script
│       └── package.json
│
├── context/                             # ✅ Architecture documentation (68 files)
│   ├── README.md                        # Documentation index
│   ├── concepts/                        # Core design docs (29 files)
│   │   ├── core.md                      # 5 primitives
│   │   ├── models.md                    # Data models
│   │   ├── architecture.md              # System design
│   │   ├── worktrees.md                 # Worktree architecture
│   │   ├── auth.md
│   │   ├── websockets.md
│   │   └── ...
│   ├── explorations/                    # Experimental designs (16 files)
│   ├── archives/                        # Historical docs (3 files)
│   ├── guidelines/                      # Development guides (7 files)
│   └── projects/                        # Project-specific docs (13 files)
│
├── docker/                              # ✅ Docker configuration
│   ├── Dockerfile.dev                   # Development image
│   ├── Dockerfile.prod                  # Production image
│   ├── docker-compose.yml               # Local development
│   ├── docker-compose.prod.yml          # Production deployment
│   ├── docker-entrypoint.sh             # Container startup script
│   └── .env.prod.example                # Production env vars
│
├── .devcontainer/                       # ✅ VS Code DevContainer
│   └── devcontainer.json
│
├── .dockerignore                        # ✅ Docker build excludes
├── .gitignore                           # ✅ Git excludes
├── .lintstagedrc.json                   # ✅ Lint-staged config
├── .prettierrc                          # ✅ Prettier config
├── biome.json                           # ✅ Biome linting/formatting
├── turbo.json                           # ✅ Turbo monorepo config
├── package.json                         # ✅ Root package (v0.7.1)
├── pnpm-lock.yaml                       # ✅ Lockfile
├── pnpm-workspace.yaml                  # ✅ Workspace config
├── tsconfig.json                        # ⚠️ Root TS config (not shared)
├── README.md                            # ✅ Product overview
├── PROJECT.md                           # ✅ Launch checklist
├── CLAUDE.md                            # ✅ Agent instructions
├── LICENSE                              # ✅ MIT license
│
├── REVIEW_REPORT.md                     # 🆕 This review's master report
├── TODO.md                              # 🆕 Prioritized action items
├── .env.example                         # 🆕 Environment variables
└── DIRECTORY_STRUCTURE.md               # 🆕 This document
```

---

## ✅ Strengths

### 1. Clear App/Package Separation
- **apps/** for deployable applications (daemon, UI, CLI, docs)
- **packages/** for shared libraries (core, agor-live)
- **Benefit**: Clear dependency graph, reusable code

### 2. Excellent Documentation Organization
- **context/** as single source of truth for architecture
- **68 markdown files** covering all aspects
- **Subdirectories** (concepts, explorations, archives, guidelines, projects)
- **README.md** as index to all docs

### 3. Proper Monorepo Tooling
- **Turbo** for task orchestration
- **pnpm workspaces** for dependency management
- **tsup** for library builds
- **Vite** for UI development

### 4. DevOps Configuration
- **Docker** (dev + prod images)
- **GitHub Actions** (CI/CD)
- **DevContainer** for standardized dev environment
- **Husky** for git hooks

### 5. Code Quality Tools
- **Biome** for linting/formatting
- **Prettier** for additional formatting
- **TypeScript** strict mode across all packages

---

## ⚠️ Recommendations

### 1. Create Package-Level README Files

**Issue**: Most packages/apps lack individual README.md files

**Current State**:
```
packages/core/         # ❌ No README
apps/agor-daemon/      # ❌ No README
apps/agor-cli/         # ❌ No README
apps/agor-ui/          # ❌ No README
apps/agor-docs/        # ❌ No README
```

**Recommended Structure**:
```
packages/core/
├── README.md                 # 🆕 Package overview
│   ├── Purpose
│   ├── Exports
│   ├── Usage examples
│   └── Development guide
└── src/
    └── ...
```

**Example README Template**:
```markdown
# @agor/core

Shared core library for the Agor platform.

## Purpose

Provides common utilities, types, database access, and agent SDK integrations
used across all Agor applications (daemon, UI, CLI).

## Installation

This package is internal to the Agor monorepo. It's not published to npm.

## Exports

- `/api` - FeathersJS client utilities
- `/db` - Drizzle ORM, repositories, migrations
- `/types` - TypeScript type definitions
- `/tools/claude` - Claude Agent SDK integration
- `/tools/codex` - OpenAI Codex integration
- `/tools/gemini` - Google Gemini integration
- `/git` - Git operations via simple-git
- `/config` - Configuration management

## Development

\`\`\`bash
# Build
pnpm build

# Test
pnpm test

# Typecheck
pnpm typecheck
\`\`\`

## Architecture

See `/context/concepts/core.md` for detailed architecture documentation.
```

**Effort**: M (2-3 hours to create all 5 READMEs)

---

### 2. Add Shared TypeScript Base Config

**Issue**: No `tsconfig.base.json` for consistent TS settings across packages

**Recommendation**: Create `/tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

Then extend in all packages:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

**Effort**: S (1 hour)

---

### 3. Create `.npmrc` File

**Issue**: No pnpm configuration file at root

**Recommendation**: Create `/.npmrc`

```ini
# pnpm workspace configuration
auto-install-peers=true
strict-peer-dependencies=false
shamefully-hoist=false

# Lockfile settings
lockfile=true
prefer-frozen-lockfile=true

# Performance
side-effects-cache=true
unsafe-perm=true
```

**Effort**: S (5 minutes)

---

### 4. Refactor Large Files (Already in TODO.md)

**Issue**: Some files violate single responsibility principle

**Files Needing Refactoring**:

1. `/apps/agor-daemon/src/index.ts` (3,171 LOC)
   - **Recommendation**: Split into:
     ```
     src/
       ├── index.ts              # Entry point (<100 LOC)
       ├── app.ts                # App factory (<200 LOC)
       ├── config/
       │   ├── cors.ts
       │   ├── socketio.ts
       │   └── auth.ts
       └── middleware/
           ├── rate-limit.ts
           └── validation.ts
     ```

2. `/apps/agor-daemon/src/mcp/routes.ts` (2,146 LOC)
   - **Recommendation**: Split by transport:
     ```
     mcp/
       ├── index.ts
       ├── routes/
       │   ├── stdio.ts
       │   ├── http.ts
       │   └── sse.ts
       └── tokens.ts
     ```

3. `/apps/agor-ui/src/components/SessionCanvas/SessionCanvas.tsx` (2,105 LOC)
   - **Recommendation**: Split into:
     ```
     SessionCanvas/
       ├── SessionCanvas.tsx      # Main component (<300 LOC)
       ├── hooks/
       │   ├── useCanvasNodes.ts
       │   ├── useCanvasDragDrop.ts
       │   └── useCanvasZones.ts
       ├── components/
       │   ├── CanvasControls.tsx
       │   └── CanvasCommentLayer.tsx
       └── utils/
           └── zoneDetection.ts
     ```

**Effort**: L (8-10 hours per file)

---

### 5. Organize Test Files Consistently

**Current State**: Tests are co-located with source files (✅ Good)

**Minor Improvement**: Add dedicated test utilities directory

**Recommendation**: Create test utilities

```
packages/core/
├── src/
│   └── ...
└── tests/                      # 🆕 Test utilities
    ├── fixtures/               # Test data fixtures
    ├── mocks/                  # Mock implementations
    └── helpers/                # Test helper functions
```

**Effort**: S (1-2 hours)

---

### 6. Database Schema Documentation

**Issue**: No standalone schema documentation

**Recommendation**: Create `/packages/core/src/db/SCHEMA.md`

**Content**:
- All tables with descriptions
- Column definitions
- Relationships (foreign keys)
- Indexes
- Migration strategy
- Entity-Relationship diagram

**Effort**: M (4-5 hours)

---

### 7. Add Scripts Directory

**Issue**: No centralized location for utility scripts

**Recommendation**: Create `/scripts/` directory

```
scripts/
├── README.md                   # Script documentation
├── setup.sh                    # Initial setup script
├── clean.sh                    # Clean build artifacts
├── reset-db.sh                 # Reset development database
├── generate-secrets.sh         # Generate JWT/master secrets
└── backup-db.sh                # Backup production database
```

**Effort**: M (3-4 hours to create useful scripts)

---

### 8. Improve Docker Directory

**Current**: Good, minor improvements possible

**Recommendation**: Add health check scripts

```
docker/
├── Dockerfile.dev
├── Dockerfile.prod
├── docker-compose.yml
├── docker-compose.prod.yml
├── docker-entrypoint.sh
├── .env.prod.example
├── healthcheck.sh              # 🆕 Health check script
└── README.md                   # 🆕 Docker documentation
```

**Effort**: S (1-2 hours)

---

## 🟢 Optional Improvements (P3)

### 1. Add `.vscode/` Settings

**Recommendation**: Standardize VS Code settings for team

```
.vscode/
├── settings.json               # Workspace settings
├── extensions.json             # Recommended extensions
├── launch.json                 # Debug configurations
└── tasks.json                  # Build tasks
```

**Effort**: S (1 hour)

---

### 2. Add Storybook Stories Directory

**Current**: Storybook configured but only 1 story

**Recommendation**: Organize stories by component type

```
apps/agor-ui/
├── src/
│   └── components/
│       └── ...
└── .storybook/
    └── stories/                # 🆕 Centralized stories
        ├── components/
        ├── layouts/
        └── examples/
```

**Effort**: M (6-8 hours to create comprehensive stories)

---

### 3. Create E2E Test Directory

**Recommendation**: Add end-to-end test directory

```
e2e/                            # 🆕 E2E tests (Playwright/Cypress)
├── fixtures/                   # Test data
├── pages/                      # Page objects
└── tests/
    ├── auth.spec.ts
    ├── sessions.spec.ts
    └── worktrees.spec.ts
```

**Effort**: L (20+ hours for comprehensive E2E coverage)

---

## Comparison to Best Practices

### Monorepo Structure (Turborepo/Nx patterns)

| Practice | Agor | Best Practice | Status |
|----------|------|---------------|--------|
| Apps vs Packages separation | ✅ | ✅ | Perfect |
| Workspace configuration | ✅ pnpm | ✅ | Perfect |
| Build orchestration | ✅ Turbo | ✅ | Perfect |
| Shared configs | ⚠️ Partial | ✅ tsconfig.base.json | Needs improvement |
| Package naming | ⚠️ Inconsistent | ✅ @scope/name | agor-ui → @agor/ui |
| Versioning strategy | ⚠️ Unclear | ✅ Documented | Needs decision |

---

### Documentation Structure

| Practice | Agor | Best Practice | Status |
|----------|------|---------------|--------|
| Architecture docs | ✅ context/ | ✅ | Excellent |
| Package READMEs | ❌ Missing | ✅ | Needs addition |
| API docs | ⚠️ Partial | ✅ Auto-generated | Needs TypeDoc |
| Contribution guide | ⚠️ Implicit | ✅ CONTRIBUTING.md | Recommended |
| Changelog | ❌ Missing | ✅ CHANGELOG.md | Recommended |

---

### Testing Structure

| Practice | Agor | Best Practice | Status |
|----------|------|---------------|--------|
| Unit tests co-located | ✅ | ✅ | Perfect |
| Integration tests | ⚠️ Partial | ✅ | Needs expansion |
| E2E tests | ❌ Missing | ✅ | Needs addition |
| Test utilities | ⚠️ Minimal | ✅ | Needs organization |

---

## Recommended Directory Structure (Future State)

**After implementing all recommendations:**

```
agor/
├── .github/                    # ✅ No changes
├── .vscode/                    # 🆕 VS Code settings
├── apps/
│   ├── agor-daemon/
│   │   ├── README.md           # 🆕
│   │   └── src/
│   │       ├── index.ts        # 🔄 Refactored (<100 LOC)
│   │       ├── app.ts          # 🆕 App factory
│   │       ├── config/         # 🆕 Configuration modules
│   │       ├── middleware/     # 🆕 Middleware modules
│   │       └── services/       # ✅ No changes
│   ├── agor-ui/
│   │   ├── README.md           # 🆕
│   │   └── src/
│   │       ├── App.tsx         # 🔄 Refactored (<300 LOC)
│   │       └── components/
│   │           └── SessionCanvas/
│   │               ├── SessionCanvas.tsx  # 🔄 Refactored
│   │               ├── hooks/  # 🆕 Extracted hooks
│   │               └── components/  # 🆕 Sub-components
│   ├── agor-cli/
│   │   └── README.md           # 🆕
│   └── agor-docs/
│       └── README.md           # 🆕
├── packages/
│   ├── core/
│   │   ├── README.md           # 🆕
│   │   └── src/
│   │       └── db/
│   │           └── SCHEMA.md   # 🆕 Schema docs
│   └── agor-live/
│       └── README.md           # 🆕
├── context/                    # ✅ No changes
├── docker/
│   ├── README.md               # 🆕
│   └── healthcheck.sh          # 🆕
├── e2e/                        # 🆕 E2E tests
├── scripts/                    # 🆕 Utility scripts
├── tests/                      # 🆕 Shared test utilities
├── .npmrc                      # 🆕 pnpm config
├── tsconfig.base.json          # 🆕 Shared TS config
├── CONTRIBUTING.md             # 🆕 Contribution guide
├── CHANGELOG.md                # 🆕 Changelog
├── REVIEW_REPORT.md            # 🆕
├── TODO.md                     # 🆕
├── .env.example                # 🆕
└── DIRECTORY_STRUCTURE.md      # 🆕 This document
```

---

## Implementation Priority

### Phase 1: Immediate (P1) - Week 1

- [ ] Create `.npmrc` (S - 5 min)
- [ ] Create `tsconfig.base.json` (S - 1 hour)
- [ ] Update packages to extend base tsconfig (S - 1 hour)
- [ ] Create package READMEs (M - 2-3 hours)

**Total Effort**: 4-5 hours

---

### Phase 2: High Priority (P1) - Week 2-3

- [ ] Create `/packages/core/src/db/SCHEMA.md` (M - 4-5 hours)
- [ ] Refactor `/apps/agor-daemon/src/index.ts` (L - 8-10 hours)
- [ ] Create `/scripts/` directory with utilities (M - 3-4 hours)

**Total Effort**: 15-19 hours

---

### Phase 3: Medium Priority (P2) - Week 4-5

- [ ] Refactor large UI components (L - 16-20 hours)
- [ ] Create test utilities directory (S - 1-2 hours)
- [ ] Add Docker documentation (S - 1-2 hours)

**Total Effort**: 18-24 hours

---

### Phase 4: Low Priority (P3) - Future

- [ ] Add `.vscode/` settings (S - 1 hour)
- [ ] Organize Storybook stories (M - 6-8 hours)
- [ ] Create E2E test directory (L - 20+ hours)
- [ ] Add CONTRIBUTING.md (M - 2-3 hours)
- [ ] Add CHANGELOG.md (S - 1 hour)

**Total Effort**: 30-35 hours

---

## Conclusion

The Agor directory structure is **well-organized and production-ready**. The identified improvements are primarily **documentation and organizational enhancements** rather than fundamental structural issues.

**Key Strengths**:
- Clear app/package separation
- Excellent documentation organization
- Proper monorepo tooling
- Good test co-location

**Key Recommendations**:
1. Add package-level READMEs (immediate)
2. Create shared TypeScript config (immediate)
3. Refactor large files (high priority)
4. Add database schema documentation (high priority)
5. Create utility scripts directory (medium priority)

**Overall Assessment**: The current structure requires **minimal changes** and serves as a solid foundation for continued development.

---

**Last Updated**: November 18, 2025
**Next Review**: Schedule after Phase 2 completion
