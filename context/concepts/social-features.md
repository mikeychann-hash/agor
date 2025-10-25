# Social Features

This document describes Agor's real-time collaboration and social features that enable multiplayer agentic development.

## Overview

Agor is fundamentally multiplayer. Multiple users can work on the same board simultaneously, seeing each other's presence, actions, and contributions in real-time. The social layer turns isolated AI coding sessions into a shared, collaborative experience.

**Core Philosophy:**

- **Real-time first** - Changes broadcast instantly via WebSockets
- **Presence awareness** - Always know who's working with you
- **Spatial collaboration** - Visual canvas enables spatial thinking and organization
- **Asynchronous discussion** - Comments persist for async collaboration
- **Anonymous-friendly** - Low friction for experimentation (anonymous mode by default)

## Features

### 1. Real-Time Presence & Cursors

**What it does:**
Users see each other's cursors moving on the canvas in real-time, creating awareness of who's active and what they're looking at.

**Technical Implementation:**

- **WebSocket broadcasting** via FeathersJS Socket.io
- **Cursor position tracking** with 100ms throttle to reduce network traffic
- **React Flow integration** - cursor positions converted to flow coordinates
- **Custom cursor nodes** - rendered as React Flow nodes for minimap visibility
- **Stale cursor cleanup** - removes cursors after 5s of inactivity
- **User context enrichment** - cursor data includes user emoji, name, color

**UX Details:**

- Smooth cursor movement with CSS transitions (0.1s ease-out)
- Each user has a distinct color from their profile
- Cursors show user emoji as the cursor icon
- Visible both on main canvas and in minimap
- No cursor shown for local user (only remote users)

**Data Model:**

```typescript
interface CursorPosition {
  user_id: string;
  board_id: string;
  x: number; // Flow coordinates
  y: number; // Flow coordinates
  timestamp: Date;
}
```

**Broadcasting:**

```typescript
// Client sends position updates (throttled to 100ms)
client.service('cursor-positions').create({ board_id, x, y });

// Server broadcasts to all users on same board
service.publish('created', (data, context) => {
  return app.channel(`board:${data.board_id}`);
});
```

**Related Files:**

- `apps/agor-ui/src/hooks/useCursorTracking.ts` - Client-side cursor tracking
- `apps/agor-ui/src/hooks/usePresence.ts` - Remote cursor subscription
- `apps/agor-ui/src/components/SessionCanvas/canvas/BoardObjectNodes.tsx` - CursorNode component
- `apps/agor-daemon/src/services/cursor-positions/` - Server-side cursor service

### 2. Active User Facepile

**What it does:**
Shows avatars of all users currently viewing the board in a compact "facepile" UI in the header.

**Technical Implementation:**

- **Active user tracking** via WebSocket room subscriptions
- **Heartbeat mechanism** - clients ping every 10s to maintain active status
- **Auto-cleanup** - users removed after 15s without heartbeat
- **User enrichment** - fetches full user data (emoji, name, email) for display

**UX Details:**

- Displayed in app header next to board name
- Shows user emoji in circular avatars
- Compact horizontal layout (overlapping avatars)
- Tooltip on hover shows full user name
- Current user highlighted with primary color border
- Maximum of 10 visible avatars (overflow hidden)

**Data Model:**

```typescript
interface ActiveUser {
  user_id: string;
  board_id: string;
  last_seen: Date;
  // Enriched client-side:
  emoji?: string;
  name?: string;
  email?: string;
}
```

**Related Files:**

- `apps/agor-ui/src/hooks/useActiveUsers.ts` - Active user tracking hook
- `apps/agor-ui/src/components/Facepile/Facepile.tsx` - Facepile UI component
- `apps/agor-daemon/src/services/active-users/` - Active user service

### 3. Board Comments (Human-to-Human Collaboration)

**What it does:**
Users can have threaded discussions about sessions, plans, and decisions directly on the board. Comments can be spatial (pinned to canvas locations) or general.

**Technical Implementation:**

- **Database-backed** - Comments stored in SQLite with full CRUD
- **WebSocket broadcasting** - Real-time comment updates
- **Threaded discussions** - Parent/child relationships for replies
- **Spatial positioning** - Optional absolute canvas coordinates
- **Reactions** - Emoji reactions on any comment
- **Rich metadata** - Mentions, resolve status, edit tracking

**UX Details:**

**Comments Panel (Left Sidebar):**

- Persistent left panel (400px width, collapsible)
- Two filter modes: "Active" (default, non-resolved) and "All"
- Threaded view with 1 level of nesting (root + replies)
- Dense typography (fontSizeSM) for compact display
- Input.Search with send icon for new comments and replies
- Hover/click highlighting synced with spatial pins
- Smooth scroll-to-view when clicking canvas pins
- Emoji reactions displayed as pills (button style when user reacted)
- Hover actions: emoji picker, reply, resolve/reopen, delete (own comments)

**Spatial Comments (Canvas Pins):**

- Click canvas with comment tool to place spatial comment
- Pin shows user emoji + reply count badge
- Hover pin → highlights thread in panel (temporary)
- Click pin → sticky highlight + scroll-to-view + open panel
- Toggle: click same pin again to deselect
- Visual hierarchy in minimap (100% alpha, top layer)

**Highlight Behavior:**

- Border uses colorPrimary for vibrant highlight
- Always-present transparent border prevents layout shift
- Minimal padding (paddingXS) inside highlight border
- Smooth transition (0.2s ease)

**Data Model:**

```typescript
interface BoardComment {
  comment_id: string; // UUIDv7
  board_id: string;
  created_by: string; // User ID
  parent_comment_id?: string; // For threaded replies
  content: string;
  position?: {
    absolute?: { x: number; y: number }; // Spatial positioning
    relative?: string; // Future: relative to session/zone
  };
  mentions?: string[]; // User IDs mentioned (future)
  reactions?: CommentReaction[];
  resolved: boolean;
  edited: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CommentReaction {
  user_id: string;
  emoji: string;
}
```

**Broadcasting:**

```typescript
// Comments broadcast to all board viewers
service.publish('created', (data, context) => {
  return app.channel(`board:${data.board_id}`);
});

// Same for patched, removed events
```

**Visual Hierarchy (MiniMap):**

1. **Comments** - 100% alpha, top layer (most important)
2. **Worktrees** - colorPrimaryBorder, middle-high layer
3. **Zones** - 40% alpha, middle-low layer
4. **Cursors** - colorWarning (bright, always visible)

**Related Files:**

- `apps/agor-ui/src/components/CommentsPanel/CommentsPanel.tsx` - Main panel UI
- `apps/agor-ui/src/components/SessionCanvas/canvas/BoardObjectNodes.tsx` - Spatial pin rendering
- `apps/agor-daemon/src/services/board-comments/` - Comment CRUD service
- `packages/core/src/types/board-comment.ts` - Type definitions

### 4. User Management & Authentication

**What it does:**
Multi-user authentication with anonymous mode support for low-friction onboarding.

**Technical Implementation:**

- **JWT-based authentication** with FeathersJS authentication
- **Local strategy** - email/password login
- **Anonymous strategy** - auto-generated guest users
- **User profiles** - emoji avatars, names, emails
- **Session persistence** - JWT stored in localStorage

**UX Details:**

- Anonymous mode by default (no signup required)
- User menu in header with emoji avatar
- Logout functionality
- Future: user settings, profile editing

**Data Model:**

```typescript
interface User {
  user_id: string; // UUIDv7
  email: string;
  password: string; // Hashed
  name: string;
  emoji: string; // Avatar emoji
  is_anonymous: boolean;
  created_at: Date;
  updated_at: Date;
}
```

**Related Files:**

- `apps/agor-daemon/src/services/users/` - User CRUD service
- `apps/agor-daemon/src/services/authentication/` - Auth service
- `apps/agor-ui/src/components/AppHeader/AppHeader.tsx` - User menu UI

## Architecture

### WebSocket Infrastructure

**FeathersJS Socket.io Integration:**

- All services auto-broadcast CRUD events to connected clients
- Channel-based subscriptions (e.g., `board:${board_id}`)
- Automatic reconnection handling
- Event-driven updates (created, patched, removed)

**Client-Side React Hooks:**

- Custom hooks wrap service calls and subscriptions
- Automatic state synchronization
- Optimistic updates for better UX
- Error handling and retry logic

**Performance Optimizations:**

- Cursor position throttling (100ms)
- Stale cursor cleanup (5s timeout)
- Heartbeat-based active user tracking (10s interval)
- Board-scoped channels (only relevant updates)

### Real-Time State Synchronization

**Pattern:**

1. Client performs action (e.g., create comment)
2. Client sends request to server via WebSocket
3. Server validates, persists to database
4. Server broadcasts event to all subscribed clients
5. All clients (including sender) update local state

**Example (Comments):**

```typescript
// Client creates comment
const comment = await client.service('board-comments').create({
  board_id,
  content,
  position: { absolute: { x, y } },
});

// Server broadcasts to all board viewers
// All clients receive 'created' event and update UI
```

### Data Flow

```
┌─────────────────────────────────────────────────────┐
│                   Client A (React)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ useCursor    │  │ usePresence  │  │ useComments│ │
│  │ Tracking     │  │              │  │            │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                 │                 │        │
│         └─────────────────┼─────────────────┘        │
│                           │                          │
│                    FeathersJS Client                 │
│                      (Socket.io)                     │
└───────────────────────────┼──────────────────────────┘
                            │
                    WebSocket Connection
                            │
┌───────────────────────────┼──────────────────────────┐
│                    FeathersJS Server                  │
│                      (Socket.io)                      │
│         ┌─────────────────┴─────────────────┐        │
│         │          Channel Router            │        │
│         │    (board:*, user:*, global)       │        │
│         └─────────────────┬─────────────────┘        │
│                           │                           │
│  ┌────────────┬───────────┼──────────┬─────────────┐ │
│  │  cursor-   │  active-  │  board-  │    users    │ │
│  │  positions │  users    │  comments│             │ │
│  └─────┬──────┴───────┬───┴────┬─────┴──────┬──────┘ │
│        │              │        │            │         │
│        └──────────────┼────────┼────────────┘         │
│                       │        │                      │
│                  LibSQL Database                      │
│              (cursor-positions ephemeral,             │
│               active-users ephemeral,                 │
│               board-comments persistent)              │
└───────────────────────────────────────────────────────┘
                            │
                    Broadcasts to all
                    connected clients
                            │
┌───────────────────────────┼──────────────────────────┐
│                   Client B (React)                    │
│                 [Same structure as Client A]          │
└───────────────────────────────────────────────────────┘
```

## Design Decisions

### Why Spatial Comments?

Traditional code review tools use line-based comments, but agentic development operates at a higher level:

- Sessions represent **units of work** (tasks, features, explorations)
- Visual canvas enables **spatial organization** (zones, proximity, clustering)
- Comments on **sessions/zones** make more sense than comments on code lines
- Spatial positioning enables **visual workflows** (kanban-style zone triggers)

### Why Anonymous Mode?

Agor is designed for experimentation with AI agents:

- **Low friction** - No signup barrier to start experimenting
- **Privacy-first** - Sensitive codebases may not want forced authentication
- **Gradual engagement** - Users can try before committing to accounts
- **Solo-to-multiplayer** - Start alone, invite collaborators later

### Why Real-Time Cursors?

Cursor awareness creates a sense of presence and collaboration:

- **Coordination** - See where teammates are working
- **Awareness** - Notice when someone joins/leaves
- **Context** - Understand focus areas during screenshares
- **Engagement** - Makes solo work feel less lonely

### Why Threaded Comments?

Single-level threading (root + replies) provides structure without complexity:

- **Simplicity** - Easy to implement, easy to understand
- **Sufficient** - Most discussions don't need deep nesting
- **Performance** - Simple queries, efficient rendering
- **Future-proof** - Can add deeper nesting if needed

## Future Enhancements

### Short-Term

- **Mentions** - @user notifications in comments
- **Comment notifications** - Desktop/email alerts for new activity
- **Comment search** - Full-text search across all board comments
- **Comment filters** - Filter by user, date, mentions, resolved status
- **Rich text** - Markdown support in comment content
- **File attachments** - Attach images/files to comments

### Medium-Term

- **Voice/video chat** - Built-in real-time communication
- **Session sharing** - Share sessions with specific users/teams
- **Board permissions** - Fine-grained access control (view, comment, edit)
- **Activity feed** - Timeline of all board activity
- **Presence indicators** - Show who's viewing each session
- **Collaborative editing** - Multiple users editing same session

### Long-Term

- **Agent-to-human comments** - AI agents ask clarifying questions
- **Decision capture** - Mark comments as decisions/blockers/questions
- **Comment analytics** - Insights on collaboration patterns
- **Integration hooks** - Slack/Discord/Teams notifications
- **Audit log** - Complete history of all social interactions
- **Replay mode** - Playback session evolution with comments

## Related Documentation

- **`concepts/architecture.md`** - System design and data flow
- **`concepts/websockets.md`** - WebSocket infrastructure details
- **`concepts/auth.md`** - Authentication and authorization
- **`concepts/board-objects.md`** - Board layout and spatial positioning
- **`concepts/multiplayer.md`** - Real-time collaboration primitives
- **`concepts/frontend-guidelines.md`** - React patterns and styling

## Implementation Checklist

- [x] Real-time cursor positions
- [x] Remote cursor rendering on canvas
- [x] Remote cursor rendering in minimap
- [x] Stale cursor cleanup
- [x] Active user tracking (heartbeat)
- [x] Facepile UI component
- [x] Board comments CRUD
- [x] Threaded comment replies
- [x] Spatial comment pins
- [x] Comment reactions (emoji)
- [x] Hover/click highlight sync
- [x] Scroll-to-view on pin click
- [x] Comment filter modes (Active/All)
- [x] Dense panel styling
- [x] Anonymous authentication
- [x] User management
- [ ] Comment mentions (@user)
- [ ] Comment notifications
- [ ] Rich text (markdown) support
- [ ] File attachments
- [ ] Voice/video chat
- [ ] Session sharing/permissions
