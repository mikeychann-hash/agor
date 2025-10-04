# Agor UI Prototype Project

## Overview

This document defines the approach for building UI mocks/prototypes for Agor using React, TypeScript, and Ant Design components.

## Tech Stack

### Core Framework
- **Vite + React + TypeScript** - Fast, modern, no framework overhead for prototyping
  - Lightweight compared to Next.js
  - Perfect for component library development
  - Easy Storybook integration
  - Can migrate to Next.js later if needed

### UI Libraries
- **Ant Design** - Primary component library
- **X Ant Design (https://x.ant.design/)** - Chat/session-specific components
  - XFlow for visual session tree/canvas
  - Bubble/Conversations for chat interfaces

### Development Tools
- **Storybook** - Component development and documentation
- **TypeScript** - Type safety for Session/Task domain models

## Project Structure

```
agor-ui/
├── src/
│   ├── types/
│   │   ├── session.ts          # Session type definitions
│   │   ├── task.ts             # Task type definitions
│   │   ├── concept.ts          # Concept type definitions
│   │   └── index.ts            # Export all types
│   │
│   ├── components/
│   │   ├── SessionCard/
│   │   │   ├── SessionCard.tsx
│   │   │   ├── SessionCard.stories.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── TaskCard/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskCard.stories.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── SessionCanvas/
│   │       ├── SessionCanvas.tsx
│   │       ├── SessionCanvas.stories.tsx
│   │       └── index.ts
│   │
│   ├── mocks/
│   │   ├── sessions.ts         # Mock session data
│   │   ├── tasks.ts            # Mock task data
│   │   └── concepts.ts         # Mock concept data
│   │
│   └── App.tsx                 # Demo app (optional)
│
├── .storybook/                 # Storybook config
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Initial Type Definitions

### Session Type
Based on AGOR.md specification:

```typescript
// src/types/session.ts
export type SessionStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface Session {
  session_id: string;
  agent: 'claude-code' | 'cursor' | 'codex' | 'gemini';
  agent_version?: string;
  status: SessionStatus;
  created_at: string;
  last_updated: string;

  // Git state
  git_state: {
    ref: string;
    base_sha: string;
    current_sha: string;
  };

  // Worktree (optional)
  worktree?: {
    path: string;
    managed_by_agor: boolean;
  };

  // Context
  concepts: string[];

  // Genealogy
  genealogy: {
    forked_from_session_id?: string;
    fork_point_task_id?: string;
    parent_session_id?: string;
    spawn_point_task_id?: string;
    children: string[];
  };

  // Tasks
  tasks: string[];
  message_count: number;

  // UI metadata
  description?: string;
}
```

### Task Type
Based on AGOR.md specification:

```typescript
// src/types/task.ts
export type TaskStatus = 'created' | 'running' | 'completed' | 'failed';

export interface Task {
  task_id: string;
  session_id: string;
  description: string;
  status: TaskStatus;

  // Message range
  message_range: {
    start_index: number;
    end_index: number;
    start_timestamp: string;
    end_timestamp?: string;
  };

  // Git state
  git_state: {
    sha_at_start: string;
    sha_at_end?: string;
    commit_message?: string;
  };

  // Model
  model: string;

  // Report
  report?: {
    template: string;
    path: string;
    generated_at: string;
  };

  created_at: string;
  completed_at?: string;
}
```

## Canvas Library Decision

### Requirements
- Infinite canvas with zoom/pan
- Drag to move objects
- Multi-select (shift-click, drag-select)
- SessionCard (built with Ant Design) as draggable nodes
- Edges showing fork/spawn relationships

### Evaluated Options

#### Option 1: React Flow ✅ (Recommended)
**Why it's perfect for Agor:**
- **Nodes ARE React components** - SessionCard (built with Ant Design) becomes a node directly
- Built-in: drag & drop, multi-selection, panning, zooming, minimap
- Edge routing for fork/spawn relationships (dashed vs solid)
- Great TypeScript support, active development (React Flow 12, Spring 2025 updates)
- Node-based paradigm matches use case (cards connected by edges)

**Pros:**
- Zero friction integrating Ant Design components
- NodeToolbar, NodeResizer built-in
- Performance optimizations available (viewport-based rendering)
- Industry standard for node-graph UIs

**Cons:**
- Performance considerations with 100+ nodes (mitigated with `onlyRenderVisibleElements`)
- Learning curve for advanced features

**Install:** `npm install reactflow`

---

#### Option 2: tldraw SDK
**Why it's NOT a fit:**
- Whiteboard/drawing tool (think mspaint, not node graphs)
- Custom shapes use `HTMLContainer` wrapper (extra abstraction layer)
- No UI component library - would still need Ant Design
- Overkill for "cards on canvas" use case
- Better for: collaborative whiteboards, drawing apps

---

#### Option 3: Konva + React-Konva
**Why it's NOT a fit:**
- Canvas-based rendering (better performance, but...)
- Would need to build selection, drag, connections ourselves
- Ant Design components wouldn't render easily (DOM vs Canvas)
- Too low-level for our needs

---

#### Option 4: XFlow (Ant Design ecosystem)
**Why it's NOT a fit:**
- More DAG/flowchart focused (less freeform canvas)
- Smaller community, less flexible
- Less Figma-like interactions

---

### Decision: React Flow

**Rationale:**
React Flow is purpose-built for interactive node-based UIs where nodes are React components. Since SessionCard will be built with Ant Design components (badges, tags, lists), React Flow allows us to use them directly without adaptation. The canvas interactions (zoom, pan, drag, multi-select) are built-in, and edges naturally represent fork/spawn relationships.

**Key insight:** We're building a "session graph UI" not a "whiteboard". React Flow is designed exactly for this.

---

## Phase 1: Initial Components

### 1. SessionCard Component
A card representing a session that **contains its tasks inline**:

**Layout:**
```
┌─────────────────────────────────────────┐
│ 🤖 Claude Code  •  RUNNING              │ ← Header
│ Build authentication system              │ ← Description
│ 📍 feature/auth @ b3e4d12                │ ← Git state
│ 📦 auth, security, api-design            │ ← Concepts
├─────────────────────────────────────────┤
│ Tasks (showing latest 10)          [↕]  │ ← Task list header
│                                          │
│ ✓ Design JWT flow                       │ ← Task item
│   💬 12 messages  🔧 5 tools  📄 report  │   (compact view)
│                                          │
│ ⚡ Implement endpoints                   │ ← Active task
│   💬 8 messages  🔧 3 tools              │
│                                          │
│ ○ Write tests                           │ ← Pending task
│   💬 0 messages                          │
│                                          │
│ ... 7 more tasks                    [⊕] │ ← Expand to see all
└─────────────────────────────────────────┘
```

**Features:**
- Header: Agent icon, status badge, session description
- Git state: Branch + current SHA (shortened)
- Concepts: Tags/chips showing loaded concepts
- Task list:
  - Shows latest ~10 tasks by default
  - Each task is a compact row with:
    - Status icon (✓ completed, ⚡ in progress, ○ pending)
    - Task description
    - Metadata widgets: message count, tool usage, report indicator
  - Scrollable/expandable to see all tasks
  - Click task row to see details (modal/side panel)
- Genealogy indicators: Fork/spawn badges in header

**Props:**
```typescript
interface SessionCardProps {
  session: Session;
  tasks: Task[];  // Tasks for this session
  onTaskClick?: (taskId: string) => void;
  onSessionClick?: () => void;
  compact?: boolean;  // Collapsed view for canvas overview
}
```

**Storybook Stories:**
- Default session with 3 tasks
- Running session with in-progress task
- Session with 15+ tasks (scrollable)
- Forked session (show fork indicator)
- Spawned session (show spawn indicator)
- Compact view (for canvas overview)

---

### 2. TaskListItem Component
Compact task row for use within SessionCard:

**Layout:**
```
┌─────────────────────────────────────────┐
│ ✓ Implement JWT authentication          │
│   💬 15 msgs  🔧 8 tools  📄 report      │
│   a4f2e91 → b3e4d12                      │ ← Git SHA change (optional)
└─────────────────────────────────────────┘
```

**Features:**
- Status icon (visual indicator)
- Task description (truncated if needed)
- Metadata badges:
  - Message count
  - Tool/function call count
  - Report indicator (if exists)
  - Git SHA progression (collapsed by default)
- Hover: Highlight, show tooltip with timestamps
- Click: Emit event for parent to handle

**Props:**
```typescript
interface TaskListItemProps {
  task: Task;
  onClick?: () => void;
  compact?: boolean;
}
```

---

### 3. SessionCanvas Component
Infinite canvas using **React Flow** for Figma-style interaction:

**Features:**
- Infinite panning/zooming canvas
- SessionCard as custom node component
- Drag to move sessions anywhere
- Multi-select sessions (Shift+Click, or drag-select)
- Edges showing fork/spawn relationships
- Minimap for navigation (React Flow built-in)
- Canvas controls (zoom in/out, fit view)

**Node Types:**
- `session-node`: Renders SessionCard
- Future: `concept-node`, `report-node`

**Edge Types:**
- `fork-edge`: Dashed line (divergent exploration)
- `spawn-edge`: Solid line (parent-child delegation)

**Layout Algorithms:**
- Start: Auto-layout using dagre or elk
- User can manually rearrange (positions saved)
- "Re-layout" button to reset to auto-layout

**Props:**
```typescript
interface SessionCanvasProps {
  sessions: Session[];
  tasks: Record<string, Task[]>;  // Map of session_id → tasks
  onSessionSelect?: (sessionId: string) => void;
  onTaskSelect?: (taskId: string) => void;
}
```

**Storybook Stories:**
- Single session (centered)
- Linear chain (A → B → C)
- Fork example (A → B, A → C)
- Complex tree (multiple forks & spawns)
- Large tree (50+ sessions, test performance)

---

### 4. TaskDetailPanel Component (Phase 2)
Side panel or modal showing full task details:
- Full description
- Complete message history (expandable)
- All tool calls with arguments
- Git diff view
- Report content (if exists)
- Timestamps and duration

This replaces the standalone TaskCard from the original design.

## Mock Data Strategy

Create reusable mock data in `src/mocks/`:

```typescript
// src/mocks/sessions.ts
import { Session } from '../types';

export const mockSessionA: Session = {
  session_id: 'abc123',
  agent: 'claude-code',
  status: 'running',
  description: 'Build authentication system',
  git_state: {
    ref: 'feature/auth',
    base_sha: 'a4f2e91',
    current_sha: 'b3e4d12'
  },
  concepts: ['auth', 'security', 'api-design'],
  genealogy: {
    children: ['def456', 'ghi789']
  },
  tasks: ['task-001', 'task-002'],
  message_count: 37,
  created_at: '2025-10-01T10:00:00Z',
  last_updated: '2025-10-01T10:30:00Z'
};

// Fork example
export const mockSessionB: Session = {
  session_id: 'def456',
  agent: 'claude-code',
  status: 'idle',
  description: 'Try OAuth 2.0 instead',
  git_state: {
    ref: 'feature/oauth',
    base_sha: 'a4f2e91',
    current_sha: 'c5f6e23'
  },
  concepts: ['auth', 'security', 'api-design'],
  genealogy: {
    forked_from_session_id: 'abc123',
    fork_point_task_id: 'task-001',
    children: []
  },
  tasks: ['task-003'],
  message_count: 15,
  created_at: '2025-10-01T10:20:00Z',
  last_updated: '2025-10-01T10:25:00Z'
};

// Full session tree
export const mockSessionTree = [mockSessionA, mockSessionB, ...];
```

## Setup Steps

1. **Initialize Vite + React + TypeScript project**
   ```bash
   npm create vite@latest agor-ui -- --template react-ts
   cd agor-ui
   npm install
   ```

2. **Install dependencies**
   ```bash
   npm install antd @ant-design/x
   npm install -D @storybook/react @storybook/addon-essentials
   npm install -D @storybook/react-vite storybook
   ```

3. **Initialize Storybook**
   ```bash
   npx storybook@latest init
   ```

4. **Create folder structure**
   ```bash
   mkdir -p src/{types,components/{SessionCard,TaskCard,SessionCanvas},mocks}
   ```

5. **Start development**
   ```bash
   npm run storybook  # Component development
   npm run dev        # App preview (optional)
   ```

## Next Steps After Phase 1

1. **Visual polish** - Refine SessionCard/TaskCard designs
2. **Interactions** - Click handlers, hover states, expand/collapse
3. **Session tree layout** - Implement canvas with proper tree visualization
4. **Concept display** - Show loaded concepts with tags/badges
5. **Report preview** - Modal or panel for viewing task reports
6. **Git integration UI** - Visual diff, commit history within sessions
7. **Multi-agent indicators** - Visual distinction for different agents

## Design Considerations

### Why Vite over Next.js?
- **Faster iteration** - No routing/SSR overhead for component library
- **Storybook-first** - Better integration for isolated component dev
- **Lighter weight** - Easier to extract components later
- **Can migrate** - Easy to port to Next.js when building full app

### Why Ant Design + X Ant Design?
- **Enterprise-grade** - Polished components, good TypeScript support
- **X Ant Design** - Purpose-built chat/conversation components
- **XFlow** - Graph visualization for session trees
- **Consistency** - Single design system

### Component Architecture
- **Atomic design** - SessionCard/TaskCard are molecules, SessionCanvas is organism
- **Type-driven** - All components receive typed props (Session, Task)
- **Storybook-driven** - Design in isolation, compose in app
- **Reusable mocks** - Shared fixtures for stories and testing

## Success Criteria

- [x] TypeScript types defined for Session, Task, Concept
- [x] SessionCard component with 7+ Storybook stories
- [x] TaskListItem component with 8+ Storybook stories
- [x] SessionCanvas showing basic tree layout with React Flow
- [x] Mock data for complex session tree (forks + spawns)
- [x] Clean, documented component API
- [x] Dark theme support with Ant Design theme system
- [x] Vitest + RTL testing setup
- [x] Task truncation with tooltip for long prompts

---

## Implementation Status (January 2025)

### Core Components Completed
- ✅ **SessionHeader** - Collapsed view for canvas overview with task/message/tool counts
- ✅ **SessionCard** - Expanded view with inline task list (shows latest 10, prioritizes running tasks)
- ✅ **SessionDrawer** - Full session detail drawer with task timeline
- ✅ **TaskListItem** - Compact task rows with truncation (120 chars) and metadata badges
- ✅ **SessionCanvas** - React Flow-based infinite canvas for session trees

### Type System
- ✅ **Task**: `full_prompt` (required), `description` (optional for AI summaries), `tool_use_count`
- ✅ **Session**: Added `tool_use_count` for aggregate metrics
- ✅ **Three view modes**: `collapsed | expanded | drawer`

### Theming & UI Standards
- ✅ **Strict Ant Design usage** - No custom CSS, only Ant Design components/props/tokens
- ✅ **Dark mode by default** - ConfigProvider with theme.darkAlgorithm
- ✅ **Icon consistency** - MessageOutlined, ToolOutlined, GithubOutlined instead of emojis
- ✅ **Tooltip strategy** - Full prompt tooltip on status icon hover (not on text)

### Mock Data Strategy
- **Default tasks**: Use `full_prompt` only (realistic - no AI summaries available)
- **Future ideal**: `mockTaskWithSummary001/002` demonstrate AI-generated descriptions
- **18+ realistic user prompts**: Multi-line, conversational, representative of real usage
- **Tool counts**: All tasks/sessions include `tool_use_count` for metrics

### Key Design Decisions
1. **No custom CSS files** - Removed index.css, rely entirely on Ant Design theming
2. **Status icon tooltip** - User hovers status icon to see full prompt (less visual clutter)
3. **Truncation length** - Increased from 60 to 120 chars (const `TRUNCATION_LENGTH`)
4. **Task display** - Show last 5 tasks chronologically (oldest → newest), "See more" button at top
5. **Separator consistency** - Use Ant Design Divider component throughout
6. **Collapsible sessions** - SessionCard uses Ant Design Collapse for task list only (header/metadata always visible)
7. **Card width** - `SESSION_CARD_MAX_WIDTH = 480` for consistent, readable cards
8. **Git SHA display** - Show only current SHA (e.g., `abc3214`), not transition arrows (follows `git describe` conventions)

### Storybook Coverage
- TaskListItem: 8 stories (including WithAISummary for future state)
- SessionCard: Multiple stories (collapsed, expanded, with drawer, many tasks)
- SessionHeader: Multiple states (running, completed, forked, spawned)
- SessionDrawer: Full integration demos

### Recent Updates (Latest Session)
- ✅ Added tool counts (`tool_use_count`) to Task and Session types
- ✅ Replaced emojis with Ant Design icons (MessageOutlined, ToolOutlined, GithubOutlined)
- ✅ Refactored SessionCard to use Collapse component (only task list collapses)
- ✅ Reduced visible tasks from 10 to 5, "See more" button moved to top
- ✅ Simplified git SHA display (removed transition arrows, show only end SHA)
- ✅ Added max width constant for SessionCard (480px)

### Next: App-Level Components

#### 1. NewSessionButton Component
**Purpose**: Floating action button to create new sessions

**Layout:**
```
┌─────────────────────────────────────┐
│                                  ⊕  │  ← Top-right corner overlay
│                                     │
│         Canvas Area                 │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- Large round button (FloatButton from Ant Design)
- Fixed position: top-right corner of canvas
- Icon: PlusOutlined or RobotOutlined
- onClick: Opens NewSessionModal

**Props:**
```typescript
interface NewSessionButtonProps {
  onCreateSession?: () => void;
}
```

---

#### 2. NewSessionModal Component
**Purpose**: Form to configure and start a new coding session

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Create New Session                    ✕    │
├─────────────────────────────────────────────┤
│                                             │
│  Select Coding Agent                        │
│  ┌─────────────────────────────────────┐   │
│  │ ● Claude Code (installed)           │   │ ← Radio/Card selection
│  │   Latest version: 1.2.3             │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ ● Codex (installed)                 │   │
│  │   Latest version: 0.5.1             │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ ○ Cursor (not installed)      [+]  │   │ ← Install option
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ ○ Gemini (not installed)      [+]  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Initial Prompt (optional)                  │
│  ┌─────────────────────────────────────┐   │
│  │ What should this session work on?   │   │ ← TextArea
│  │                                     │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Advanced Options                      ▼    │ ← Collapsible
│                                             │
│           [Cancel]  [Create Session]        │
└─────────────────────────────────────────────┘
```

**Features:**
- **Agent selection**: Radio cards showing installed vs available agents
- **Install button**: For non-installed agents, triggers installation flow
- **Initial prompt**: Optional TextArea for starting task
- **Advanced options** (collapsed):
  - Git branch to use
  - Worktree management
  - Model selection (if agent supports multiple)
- **Validation**: Require agent selection
- **onCreate callback**: Returns selected agent + config

**Props:**
```typescript
interface Agent {
  id: string;
  name: string;
  icon: string;
  installed: boolean;
  version?: string;
  description?: string;
}

interface NewSessionModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (config: {
    agent: string;
    initialPrompt?: string;
    gitBranch?: string;
    createWorktree?: boolean;
  }) => void;
  availableAgents: Agent[];
}
```

**Agent Installation Flow:**
- Click `[+]` button next to non-installed agent
- Shows installation modal/drawer with progress
- Uses Ant Design Steps component to show install progress
- On completion, updates agent to `installed: true`

**Storybook Stories:**
- Default view (2 installed, 2 not installed)
- All agents installed
- No agents installed
- With initial prompt pre-filled
- Advanced options expanded

---

#### 3. App Component (Main Canvas View)
**Purpose**: Top-level component orchestrating canvas + UI controls

**Layout:**
```
┌───────────────────────────────────────────────┐
│  Agor                              [≡] [⚙]   │ ← Header
├───────────────────────────────────────────────┤
│                                            ⊕  │ ← NewSessionButton
│   ┌─────────┐                                │
│   │Session A│                                │
│   │ ├─ ✓ Task 1                             │
│   │ ├─ ⚡ Task 2                             │
│   │ └─ ○ Task 3                             │
│   └─────────┘                                │
│        ↓ fork                                │
│   ┌─────────┐    ┌─────────┐                │
│   │Session B│    │Session C│                │
│   └─────────┘    └─────────┘                │
│                                              │
│              Canvas Area                     │
│          (SessionCanvas component)           │
│                                              │
└───────────────────────────────────────────────┘
```

**Features:**
- Header with app title, menu, settings
- SessionCanvas taking full viewport
- NewSessionButton as overlay
- NewSessionModal (controlled by state)

**State Management:**
- Sessions list
- Active session (for drawer)
- Modal open/closed
- Selected agents/tasks

---

### Implementation Priority

1. **NewSessionButton** - Simple FloatButton wrapper (30 min)
2. **NewSessionModal** - Form with agent selection (2-3 hours)
3. **Mock agent data** - Available agents list (30 min)
4. **App component** - Wire everything together (1-2 hours)
5. **Agent installation flow** - Modal with Steps component (2 hours)

### Technical Notes
- Use Ant Design FloatButton for new session button
- Use Modal + Form components for session creation
- Radio.Group with Card layout for agent selection
- Consider using Ant Design Steps for installation progress
- Mock the agent installation API (async function returning Promise)

### Mock Data Needed
```typescript
// src/mocks/agents.ts
export interface Agent {
  id: string;
  name: 'claude-code' | 'cursor' | 'codex' | 'gemini';
  icon: string;
  installed: boolean;
  version?: string;
  description?: string;
  installable: boolean; // Can Agor install this?
}

export const mockAgents: Agent[] = [
  {
    id: 'claude-code',
    name: 'claude-code',
    icon: '🤖',
    installed: true,
    version: '1.2.3',
    description: 'Anthropic Claude Code agent',
    installable: true,
  },
  {
    id: 'codex',
    name: 'codex',
    icon: '💻',
    installed: true,
    version: '0.5.1',
    description: 'OpenAI Codex agent',
    installable: true,
  },
  {
    id: 'cursor',
    name: 'cursor',
    icon: '✏️',
    installed: false,
    description: 'Cursor AI agent',
    installable: true,
  },
  {
    id: 'gemini',
    name: 'gemini',
    icon: '💎',
    installed: false,
    description: 'Google Gemini agent',
    installable: true,
  },
];
```

---

**Philosophy:** Start visual, iterate fast, build reusable. The UI prototypes will inform the backend implementation.
