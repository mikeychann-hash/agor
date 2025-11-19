# Agor - Quick Start Guide

**Updated**: November 18, 2025 (Post-Comprehensive Review)
**Target Audience**: Developers setting up Agor for the first time
**Estimated Time**: 15-30 minutes

---

## What is Agor?

Agor is a **multiplayer AI agent orchestration platform** that lets you:
- 🤖 Manage Claude Code, Codex, and Gemini sessions in one place
- 🌳 Organize work with git worktrees and isolated environments
- 🎨 Visualize sessions on a spatial 2D canvas
- 👥 Collaborate in real-time with presence/cursor tracking
- 📝 Generate markdown reports from completed tasks

---

## Prerequisites

**Required**:
- **Node.js**: v20.x (v20 LTS recommended)
- **pnpm**: v9.15.1+ (`npm install -g pnpm@latest`)
- **Git**: v2.0+
- **SQLite**: Usually pre-installed on macOS/Linux

**Optional**:
- **Docker**: For containerized deployment
- **VS Code**: Recommended IDE (DevContainer support)

**API Keys** (at least one required):
- Anthropic API Key (for Claude Code)
- OpenAI API Key (for Codex)
- Google Gemini API Key (for Gemini)

---

## Installation Methods

### Method 1: Quick Install (Recommended for Users)

```bash
# Install globally via npm
npm install -g agor-live

# Initialize configuration
agor init

# Start daemon
agor daemon start

# Open UI in browser
agor open
```

---

### Method 2: Development Setup (Recommended for Contributors)

#### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/agor.git
cd agor
```

#### Step 2: Install Dependencies

```bash
# Install pnpm if not already installed
npm install -g pnpm@9.15.1

# Install all dependencies
pnpm install
```

#### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your API keys
nano .env  # or use your preferred editor
```

**Minimum configuration**:
```bash
# In .env file:
ANTHROPIC_API_KEY=sk-ant-your-key-here  # Get at https://console.anthropic.com/
# OR
OPENAI_API_KEY=sk-your-key-here         # Get at https://platform.openai.com/
# OR
GEMINI_API_KEY=your-key-here            # Get at https://aistudio.google.com/
```

#### Step 4: Start Development Servers

**Option A: Simplified 2-Process Workflow (Recommended)**

```bash
# Terminal 1: Daemon (watches core + daemon, auto-restarts)
cd apps/agor-daemon
pnpm dev

# Terminal 2: UI dev server
cd apps/agor-ui
pnpm dev
```

The daemon will:
- Watch `packages/core/` for changes and rebuild automatically
- Watch `apps/agor-daemon/` for changes and restart automatically
- Start on http://localhost:3030

The UI will:
- Start on http://localhost:5173
- Hot-reload on file changes
- Automatically proxy WebSocket requests to daemon

**Option B: Using Turbo (All Services)**

```bash
# Start all services concurrently
pnpm dev

# This starts:
# - agor-daemon (backend)
# - agor-ui (frontend)
# - agor-docs (documentation site)
```

#### Step 5: Verify Installation

Open your browser to **http://localhost:5173**

You should see:
1. Login screen (if anonymous mode disabled) or
2. Empty board with "New Session" button

---

### Method 3: Docker Setup

#### Step 1: Clone and Configure

```bash
git clone https://github.com/yourusername/agor.git
cd agor
cp .env.example .env
# Edit .env with your API keys
```

#### Step 2: Start with Docker Compose

**Development**:
```bash
docker-compose up -d
```

**Production**:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### Step 3: Access Agor

- **UI**: http://localhost:5173 (dev) or http://localhost:3030 (prod)
- **API**: http://localhost:3030
- **Docs**: http://localhost:3001

---

## First Steps After Installation

### 1. Create Your First Repository

```bash
# Via CLI
agor repo add my-project /path/to/your/project

# Via UI
# Click Settings → Repositories → Add Repository
```

### 2. Create Your First Worktree

```bash
# Via CLI
agor worktree create main --repo my-project --path /path/to/worktree

# Via UI
# Click "New Worktree" → Select repository → Choose branch
```

### 3. Start Your First Session

**Via UI** (Recommended):
1. Click "New Session" button
2. Select agentic tool (Claude Code, Codex, or Gemini)
3. Select worktree
4. Choose permission mode
5. Type your first prompt
6. Press Enter or click "Send"

**Via CLI**:
```bash
# Create session
agor session create \
  --agent claude-code \
  --worktree <worktree-id> \
  --prompt "Explain the codebase structure"

# List sessions
agor session list

# View session details
agor session show <session-id>
```

---

## Understanding the UI

### Main Canvas

The canvas displays **worktrees** as primary cards, with nested sessions inside.

**Interactions**:
- **Drag worktrees** to organize spatially
- **Click session** to open drawer and view conversation
- **Right-click** to access context menu (fork, spawn, delete)
- **Zoom/pan** to navigate large boards

### Session Drawer

Opened when you click a session card.

**Features**:
- View conversation history
- Send new prompts
- Adjust permission mode (READ_ONLY, AUTO_APPROVE, PROMPT_PER_TOOL)
- Configure thinking mode (auto, manual, off)
- Fork session at decision points
- Spawn child session for subtasks

### Settings Modal

Access via ⚙️ icon in top-right.

**Tabs**:
- **Boards**: Create/manage boards
- **Repositories**: Add/remove git repositories
- **Worktrees**: Manage worktrees (create, delete, view status)
- **Users**: User management (if multi-user enabled)
- **MCP Servers**: Configure Model Context Protocol servers
- **Agentic Tools**: Set global defaults for Claude/Codex/Gemini

---

## Common Workflows

### Workflow 1: Code Review

```bash
# 1. Create worktree for feature branch
agor worktree create feature/new-login --repo my-app

# 2. Start session with Claude Code
agor session create \
  --agent claude-code \
  --worktree <worktree-id> \
  --prompt "Review the authentication changes in this branch for security issues"

# 3. View results
agor session show <session-id>
```

### Workflow 2: Parallel Exploration

```bash
# 1. Create main session
SESSION_ID=$(agor session create \
  --agent claude-code \
  --worktree <worktree-id> \
  --prompt "Analyze the database schema")

# 2. Spawn child sessions for different aspects
agor session spawn $SESSION_ID --prompt "Focus on the users table"
agor session spawn $SESSION_ID --prompt "Focus on the sessions table"
agor session spawn $SESSION_ID --prompt "Focus on performance indexes"

# 3. View genealogy tree
agor session show $SESSION_ID --genealogy
```

### Workflow 3: Iterative Refinement

```bash
# 1. Start session
SESSION_ID=$(agor session create \
  --agent claude-code \
  --worktree <worktree-id> \
  --prompt "Implement user registration endpoint")

# 2. Review output
agor session show $SESSION_ID

# 3. Fork to try different approach
FORK_ID=$(agor session fork $SESSION_ID --prompt "Use email verification instead of SMS")

# 4. Compare both approaches
agor session show $SESSION_ID
agor session show $FORK_ID
```

---

## Configuration

### User Configuration File

Located at `~/.agor/config.yaml`

**Edit via CLI**:
```bash
# Set daemon port
agor config set daemon.port 4000

# Set UI port
agor config set ui.port 5174

# Enable anonymous mode
agor config set daemon.allowAnonymous true

# Set default permission mode
agor config set defaults.permissionMode READ_ONLY
```

**Edit manually**:
```yaml
# ~/.agor/config.yaml
daemon:
  port: 3030
  host: localhost
  allowAnonymous: true

ui:
  port: 5173

defaults:
  permissionMode: PROMPT_PER_TOOL
  agenticTool: claude-code
  thinkingMode: auto

secrets:
  jwtSecret: <auto-generated>
```

### Environment Variables

See `.env.example` for complete documentation.

**Common variables**:
- `PORT` - Daemon port (default: 3030)
- `UI_PORT` - UI dev server port (default: 5173)
- `ANTHROPIC_API_KEY` - Claude API key
- `OPENAI_API_KEY` - Codex API key
- `GEMINI_API_KEY` - Gemini API key
- `CORS_ORIGIN` - Frontend origin (default: auto-computed)
- `NODE_ENV` - Environment (development|production)

---

## Troubleshooting

### Issue: "Failed to connect to daemon"

**Symptoms**: UI shows connection error

**Solutions**:
1. Verify daemon is running:
   ```bash
   curl http://localhost:3030/health
   # Should return: {"status":"ok"}
   ```

2. Check daemon logs:
   ```bash
   cd apps/agor-daemon
   pnpm dev
   # Look for "🚀 Agor daemon listening on http://localhost:3030"
   ```

3. Verify CORS settings:
   ```bash
   # In .env:
   CORS_ORIGIN=http://localhost:5173
   ```

4. In Docker, use `host.docker.internal`:
   ```bash
   VITE_DAEMON_URL=http://host.docker.internal:3030
   ```

---

### Issue: "API keys stored in plaintext" warning

**Symptoms**: Console warning on daemon startup

**Solution**: Set master secret for encryption

```bash
# Generate secure secret
openssl rand -base64 32

# Add to .env:
AGOR_MASTER_SECRET=<your-generated-secret>

# Restart daemon
```

---

### Issue: "Port already in use"

**Symptoms**: Daemon or UI fails to start

**Solutions**:
1. Find process using port:
   ```bash
   lsof -ti:3030  # Daemon port
   lsof -ti:5173  # UI port
   ```

2. Kill process:
   ```bash
   lsof -ti:3030 | xargs kill -9
   ```

3. Or change ports in `.env`:
   ```bash
   PORT=4000      # Daemon
   UI_PORT=6000   # UI
   ```

---

### Issue: "Database locked" errors

**Symptoms**: SQLite errors when multiple operations run

**Solutions**:
1. Ensure only one daemon instance is running
2. Check for zombie processes:
   ```bash
   ps aux | grep agor
   ```
3. Restart daemon if needed

---

### Issue: Session not responding

**Symptoms**: Session shows "running" but no messages appear

**Solutions**:
1. Check WebSocket connection in browser console:
   ```javascript
   // Look for: "🔌 Connected to daemon"
   ```

2. Verify session status:
   ```bash
   agor session show <session-id>
   ```

3. Stop stuck session:
   ```bash
   agor session stop <session-id>
   ```

4. Check daemon logs for errors

---

## Best Practices

### Permission Modes

**READ_ONLY** (Safest):
- Agent can only read files
- No modifications allowed
- Best for: Code review, analysis, documentation

**PROMPT_PER_TOOL** (Balanced):
- Agent requests permission for each action
- You approve/deny in UI
- Best for: Development, refactoring, feature implementation

**AUTO_APPROVE** (Fastest):
- Agent executes all actions automatically
- Use with caution!
- Best for: Trusted agents, low-risk tasks

### Thinking Mode

**Auto** (Recommended):
- Automatically detects keywords ("think", "think hard", "ultrathink")
- Allocates thinking tokens based on prompt
- Best for: General use

**Manual**:
- You set explicit token budget (0-32k)
- Consistent thinking allocation
- Best for: Benchmarking, specific use cases

**Off**:
- No thinking mode
- Faster responses, lower cost
- Best for: Simple queries, cost-sensitive scenarios

### Worktree Organization

**Pattern 1: Branch-Based** (Recommended)
- One worktree per feature branch
- Clean separation of work
- Easy to delete when merged

**Pattern 2: Task-Based**
- One worktree per task or ticket
- Keeps context isolated
- Good for parallel work

**Pattern 3: Agent-Based**
- One worktree per agentic tool
- Test different agents on same code
- Compare results

---

## Next Steps

1. **Read Documentation**:
   - **Product overview**: `README.md`
   - **Agent instructions**: `CLAUDE.md`
   - **Architecture docs**: `context/README.md`
   - **Launch checklist**: `PROJECT.md`

2. **Explore Context Documentation**:
   ```bash
   cd context/concepts/
   ls -la  # See all architecture docs
   ```

3. **Run Tests**:
   ```bash
   pnpm test              # Unit tests
   pnpm test:coverage     # Coverage report
   ```

4. **Build for Production**:
   ```bash
   pnpm build             # Build all packages
   ```

5. **Deploy**:
   - See `docker/README.md` for Docker deployment
   - See `TODO.md` for production hardening checklist

---

## Getting Help

**Documentation**:
- Website: https://agor.live
- Context docs: `/context/README.md`
- API docs: http://localhost:3030/docs (when daemon running)

**Community**:
- GitHub Issues: https://github.com/yourusername/agor/issues
- Discussions: https://github.com/yourusername/agor/discussions
- Discord: [Your invite link]

**CLI Help**:
```bash
agor --help              # General help
agor session --help      # Session commands
agor worktree --help     # Worktree commands
agor repo --help         # Repository commands
```

---

## Development Resources

**For Contributors**:
- Read `CONTRIBUTING.md` (create this based on TODO.md recommendations)
- Review `TODO.md` for known issues and planned improvements
- Check `REVIEW_REPORT.md` for architecture insights
- Review `DIRECTORY_STRUCTURE.md` for codebase organization

**Key Files**:
- `CLAUDE.md` - Instructions for AI agents working on Agor
- `PROJECT.md` - Launch checklist and milestones
- `.env.example` - Environment variable reference
- `turbo.json` - Monorepo build configuration

**Architecture**:
- 5 Primitives: Session, Task, Worktree, Board, Report
- Real-time: FeathersJS + Socket.io
- Database: SQLite + Drizzle ORM
- Frontend: React + Ant Design + React Flow
- Backend: FeathersJS + Express
- AI SDKs: Claude Agent SDK, Codex, Gemini

---

## Quick Reference

### CLI Commands

```bash
# Configuration
agor init                          # Initialize config
agor config set <key> <value>      # Set config value
agor config get <key>              # Get config value

# Daemon
agor daemon start                  # Start daemon
agor daemon stop                   # Stop daemon
agor daemon status                 # Check status

# Repositories
agor repo list                     # List repositories
agor repo add <name> <path>        # Add repository
agor repo rm <name>                # Remove repository

# Worktrees
agor worktree list                 # List worktrees
agor worktree create <branch>      # Create worktree
agor worktree rm <id>              # Remove worktree

# Sessions
agor session list                  # List sessions
agor session create                # Create session (interactive)
agor session show <id>             # Show session details
agor session stop <id>             # Stop session
agor session rm <id>               # Remove session
agor session fork <id>             # Fork session
agor session spawn <id>            # Spawn child session

# Boards
agor board list                    # List boards
agor board create <name>           # Create board

# Utility
agor open                          # Open UI in browser
agor health                        # Check daemon health
```

### Keyboard Shortcuts (UI)

```
N          - New session
Cmd/Ctrl+K - Command palette (if implemented)
Escape     - Close drawers/modals
Tab        - Navigate between elements (accessibility)
Space      - Pan canvas (React Flow default)
```

### Default Ports

| Service | Port | URL |
|---------|------|-----|
| Daemon (API + WebSocket) | 3030 | http://localhost:3030 |
| UI (Development) | 5173 | http://localhost:5173 |
| UI (Production via Daemon) | 3030 | http://localhost:3030 |
| Docs | 3001 | http://localhost:3001 |

---

## What's Next?

Based on the recent comprehensive review, here are recommended areas to explore:

**For Users**:
1. ✅ Try different permission modes (READ_ONLY vs PROMPT_PER_TOOL)
2. ✅ Experiment with thinking mode keywords ("think hard about...")
3. ✅ Explore genealogy features (fork, spawn)
4. ✅ Set up MCP servers for custom context

**For Contributors**:
1. 📖 Read `REVIEW_REPORT.md` for architecture insights
2. 📝 Check `TODO.md` for prioritized issues (69 items identified)
3. 🔒 Review security considerations (especially multi-user limitations)
4. ♿ Help improve accessibility (WCAG 2.1 compliance)

**For Deployers**:
1. 🚀 Review production deployment checklist in `TODO.md`
2. 🔐 Set up AGOR_MASTER_SECRET and JWT_SECRET
3. 🐳 Use Docker production image (see `docker/Dockerfile.prod`)
4. 📊 Set up monitoring (health checks, error tracking, logs)

---

**Happy Coding with Agor!** 🚀

*Last Updated: November 18, 2025 (Post-Comprehensive Review)*
*Next Review: Schedule 6 months after addressing P0/P1 issues*
