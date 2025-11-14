# Windows 10/11 Setup Guide

This guide covers installing and running Agor on Windows 10/11.

## Prerequisites

### Required Software

1. **Node.js 20.x** (⚠️ NOT v22.x - the project requires v20.x)
   ```powershell
   # Download from https://nodejs.org/
   # Or use nvm-windows:
   nvm install 20
   nvm use 20
   ```

2. **Git for Windows**
   ```powershell
   # Download from https://git-scm.com/download/win
   # Or use winget:
   winget install Git.Git
   ```

3. **pnpm 9.x** (Package Manager)
   ```powershell
   npm install -g pnpm
   ```

4. **PowerShell 7.x** (Recommended for best experience)
   ```powershell
   winget install Microsoft.PowerShell
   ```

### Optional (For Claude/Codex/Gemini)

- **Claude Code CLI**: `npm install -g @anthropic-ai/claude-code`
- **Codex CLI**: `npm install -g @openai/codex`
- **Gemini CLI**: `npm install -g @google/gemini-cli-core`

## Installation

### 1. Clone the Repository

```powershell
git clone https://github.com/preset-io/agor.git
cd agor
```

### 2. Install Dependencies

```powershell
pnpm install
```

⚠️ **Note:** If you see "symlink creation failed" warnings, this is expected on Windows without admin rights. The fallback mechanism will handle it.

### 3. Build the Project

```powershell
pnpm build
```

### 4. Initialize Configuration

```powershell
pnpm agor init
```

This creates `~/.agor/config.yaml` and sets up the database.

## Running Agor

### Development Mode (Watch + Auto-Reload)

**Terminal 1 - Daemon:**
```powershell
cd apps/agor-daemon
pnpm dev
```

**Terminal 2 - UI:**
```powershell
cd apps/agor-ui
pnpm dev
```

The UI will open automatically at `http://localhost:5173`.

### Production Mode

```powershell
# Build all packages
pnpm build

# Start daemon
cd apps/agor-daemon
pnpm start

# In another terminal, open UI
pnpm agor open
```

## Windows-Specific Notes

### 1. Shell Integration

- **Default Shell:** PowerShell (instead of bash on Unix)
- **Terminal:** Windows Terminal recommended for best experience
- **tmux:** Not available on Windows (gracefully disabled)

### 2. Path Differences

Agor handles Windows path differences automatically:
- Uses `NULL_DEVICE = 'NUL'` instead of `/dev/null`
- Detects git at: `C:\Program Files\Git\bin\git.exe`
- Uses `%USERPROFILE%` instead of `$HOME`

### 3. Symlinks & Admin Rights

Agor uses junction points on Windows (doesn't require admin rights):
```javascript
// Automatically handled in postinstall.js
const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';
```

If you encounter symlink errors:
1. Run PowerShell as Administrator (recommended)
2. OR: Enable Developer Mode in Windows Settings
3. OR: Agor will fall back to copying files

### 4. Environment Variables

Set environment variables using PowerShell:

```powershell
# Temporary (current session)
$env:ANTHROPIC_API_KEY = "sk-ant-..."
$env:GITHUB_TOKEN = "ghp_..."

# Permanent (user profile)
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "sk-ant-...", "User")
```

Or use Agor's built-in config:
```powershell
pnpm agor config set apiKeys.ANTHROPIC_API_KEY "sk-ant-..."
```

### 5. Line Endings

The repository includes `.gitattributes` for automatic line ending normalization:
- **Source files:** LF (Unix-style)
- **PowerShell scripts:** CRLF (Windows-style)

If you see "LF will be replaced by CRLF" warnings, this is expected and safe.

## Troubleshooting

### "Command not found" Errors

If `pnpm` or `agor` commands aren't recognized:

```powershell
# Reload PATH
refreshenv

# Or restart PowerShell

# Verify installation
where.exe pnpm
where.exe node
```

### Port Already in Use

```powershell
# Find process using port 3030 (daemon)
netstat -ano | findstr :3030

# Kill process by PID
taskkill /F /PID <PID>

# Or change port
pnpm agor config set daemon.port 4000
```

### Build Errors

```powershell
# Clean rebuild
pnpm clean
pnpm install
pnpm build
```

### Database Locked

```powershell
# Stop daemon first
# Then remove lock
Remove-Item "$env:USERPROFILE\.agor\agor.db-shm"
Remove-Item "$env:USERPROFILE\.agor\agor.db-wal"
```

### Git Operations Fail

Ensure Git for Windows is in PATH:
```powershell
git --version
# Should show: git version 2.x.x.windows.x
```

If not found:
```powershell
# Add to PATH (replace with your Git installation path)
$env:PATH += ";C:\Program Files\Git\bin"
```

## Known Limitations

### tmux Not Available

- **Impact:** No persistent terminal sessions across browser refreshes
- **Workaround:** Use Windows Terminal with manual session management
- **Status:** Gracefully disabled on Windows (no errors)

### Makefile Commands

The root `Makefile` requires Unix `make`. Use npm scripts instead:

```powershell
# Instead of: make build
pnpm build

# Instead of: make test
pnpm test

# Instead of: make clean
pnpm clean
```

## Performance Tips

1. **Windows Defender:** Add project folder to exclusions
   ```powershell
   Add-MpPreference -ExclusionPath "C:\path\to\agor"
   ```

2. **WSL Alternative:** For better performance, consider using WSL2:
   ```powershell
   wsl --install
   # Then follow Linux setup instructions
   ```

3. **Node Version Manager:** Use nvm-windows for easy Node.js version switching
   ```powershell
   nvm install 20
   nvm use 20
   ```

## Getting Help

- **Documentation:** https://agor.live/docs
- **Issues:** https://github.com/preset-io/agor/issues
- **Discord:** https://discord.gg/agor (coming soon)

## Next Steps

- [Quick Start Guide](../README.md#quick-start)
- [Configuration](./CONFIGURATION.md)
- [Contributing](./CONTRIBUTING.md)

---

**Last Updated:** 2025-11-14
