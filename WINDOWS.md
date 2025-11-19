# Agor for Windows - Complete Guide

**Last Updated**: November 18, 2025

This guide provides Windows-specific instructions for installing and running Agor.

---

## 📋 Prerequisites

Before running any batch files, ensure you have:

### Required:
- **Windows 10/11** (64-bit)
- **Node.js v20.x** - [Download](https://nodejs.org/)
- **Git for Windows** - [Download](https://git-scm.com/download/win)

### Optional:
- **Visual Studio Code** - [Download](https://code.visualstudio.com/)
- **Windows Terminal** - [Get from Microsoft Store](https://aka.ms/terminal)

---

## 🚀 Quick Start (Easiest Method)

### First Time Setup - One Click!

1. **Download or clone** the Agor repository
2. **Double-click**: `quick-start.bat`
3. **Wait** 10-15 minutes for complete setup
4. **Add your API keys** when prompted
5. **Done!** Agor will launch automatically

That's it! The `quick-start.bat` handles everything:
- Checks prerequisites
- Installs dependencies
- Sets up environment
- Builds packages
- Launches development servers

---

## 📦 Batch Files Reference

### Core Files (Most Used)

#### `quick-start.bat` ⭐ **RECOMMENDED FOR FIRST-TIME USERS**
**What it does**: Complete setup + launch in one command
- Runs full setup
- Checks for API keys
- Launches dev servers

**When to use**: First time installation, or after fresh clone

**Run**: Double-click or `.\quick-start.bat`

---

#### `setup.bat` 🔧
**What it does**: Initial installation and configuration
- Checks Node.js, pnpm, Git
- Installs pnpm if missing
- Installs all dependencies
- Creates .env from template
- Builds all packages
- Verifies installation

**When to use**:
- First time setup (if not using quick-start)
- After pulling major updates
- After changing package.json files

**Run**: Double-click or `.\setup.bat`

**Time**: ~10-15 minutes (first run)

---

#### `dev.bat` 💻
**What it does**: Starts development mode
- Launches daemon (backend) on http://localhost:3030
- Launches UI (frontend) on http://localhost:5173
- Enables hot-reload (auto-refresh on code changes)
- Opens in separate windows

**When to use**: Daily development work

**Run**: Double-click or `.\dev.bat`

**Stop**: Close both terminal windows or press Ctrl+C in each

**Access UI**: http://localhost:5173

---

#### `start.bat` 🚀
**What it does**: Starts production mode
- Runs built/optimized version
- Single server on http://localhost:3030
- UI served by daemon (no separate UI server)

**When to use**: Testing production build, running in production

**Run**: Double-click or `.\start.bat`

**Stop**: Press Ctrl+C in terminal

**Access UI**: http://localhost:3030

---

### Utility Files

#### `clean.bat` 🧹
**What it does**: Removes build artifacts
- Deletes all `dist/` folders
- Removes `.turbo/` cache
- Clears `.tsbuildinfo` files
- Clears `node_modules/.cache`

**When to use**:
- Build issues or weird errors
- Before fresh rebuild
- Freeing disk space

**Run**: `.\clean.bat`

**Time**: ~30 seconds

---

#### `reset.bat` 🔄
**What it does**: Nuclear option - complete reset
- Runs `clean.bat`
- Deletes ALL `node_modules` folders
- Clears pnpm cache
- Reinstalls all dependencies
- Rebuilds all packages

**When to use**:
- Severe dependency issues
- After major version updates
- When nothing else works

**Run**: `.\reset.bat`

**Time**: ~10-15 minutes

**⚠️ WARNING**: This is a complete reset. Use only when necessary.

---

#### `test.bat` ✅
**What it does**: Runs all tests
- Executes test suite across all packages
- Shows test results

**When to use**: Before committing code, verifying changes

**Run**: `.\test.bat`

**Time**: ~1-3 minutes

---

## 🎯 Common Workflows

### First Time Setup

```batch
REM Method 1: One-click (easiest)
quick-start.bat

REM Method 2: Step-by-step
setup.bat
REM Then add API keys to .env
notepad .env
dev.bat
```

---

### Daily Development

```batch
REM Start development servers
dev.bat

REM After making changes, restart if needed:
REM (Usually auto-reload works, but sometimes you need to restart)
REM 1. Close terminal windows
REM 2. Run dev.bat again
```

---

### Testing Changes

```batch
REM Run tests
test.bat

REM If tests fail, check which package has issues
REM Run tests for specific package:
cd packages\core
pnpm test
```

---

### Build Issues

```batch
REM Light clean (removes build artifacts only)
clean.bat
pnpm build

REM If still broken, full reset
reset.bat
```

---

### Production Testing

```batch
REM Build for production
pnpm build

REM Start in production mode
start.bat

REM Access at: http://localhost:3030
```

---

## 🔧 Environment Setup

### Creating .env File

The `setup.bat` script creates `.env` from `.env.example` automatically.

**To edit manually**:

```batch
REM Open .env in Notepad
notepad .env

REM Or use VS Code
code .env
```

**Required variables** (add at least one):

```bash
# Anthropic Claude (recommended)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# OpenAI Codex
OPENAI_API_KEY=sk-your-openai-key-here

# Google Gemini
GEMINI_API_KEY=your-gemini-key-here
```

**Get API keys**:
- **Claude**: https://console.anthropic.com/
- **OpenAI**: https://platform.openai.com/api-keys
- **Gemini**: https://aistudio.google.com/app/apikey

---

## 🐛 Troubleshooting

### "Node.js is not installed"

**Solution**:
1. Download Node.js v20.x from https://nodejs.org/
2. Install (check "Add to PATH" option)
3. Restart terminal
4. Run `setup.bat` again

---

### "pnpm is not installed"

The `setup.bat` script auto-installs pnpm, but if it fails:

**Solution**:
```batch
npm install -g pnpm@9.15.1
```

If you get permission errors:
- Run terminal as Administrator
- Or use `npm install -g pnpm@9.15.1 --force`

---

### "Failed to install dependencies"

**Solution**:
```batch
REM Try with force flag
pnpm install --force

REM If still fails, reset completely
reset.bat
```

---

### "Port already in use"

**Error**: `Port 3030 is already in use`

**Solution**:
```batch
REM Find what's using the port
netstat -ano | findstr :3030

REM Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

REM Or change port in .env
notepad .env
REM Add: PORT=4000
```

---

### "Build failed" or "TypeScript errors"

**Solution**:
```batch
REM Clean and rebuild
clean.bat
pnpm build

REM If still fails
reset.bat
```

---

### Development servers won't start

**Solution**:
```batch
REM 1. Check if dependencies installed
dir node_modules

REM 2. If missing, run setup
setup.bat

REM 3. Check if .env exists
dir .env

REM 4. If missing, create from example
copy .env.example .env
notepad .env

REM 5. Try starting again
dev.bat
```

---

### "ENOENT" or "Cannot find module" errors

**Solution**:
```batch
REM Full reset usually fixes this
reset.bat
```

---

### Windows Defender / Antivirus blocking

Some antivirus software may block Node.js or pnpm operations.

**Solution**:
1. Add Agor folder to antivirus exclusions
2. Add `node.exe` to exclusions
3. Temporarily disable antivirus during installation

**Folders to exclude**:
- `C:\Program Files\nodejs\`
- `C:\Users\<YourName>\AppData\Roaming\npm\`
- Your Agor project folder

---

### Long path names (Windows limitation)

Windows has a 260 character path limit that can cause issues.

**Solution**:
```batch
REM Enable long paths (run as Administrator)
reg add HKLM\SYSTEM\CurrentControlSet\Control\FileSystem /v LongPathsEnabled /t REG_DWORD /d 1 /f

REM Or install Agor in shorter path
REM Good: C:\agor
REM Bad: C:\Users\YourName\Documents\Projects\Work\Agor\agor
```

---

## 💡 Tips & Best Practices

### Use Windows Terminal

**Why**: Better experience than cmd.exe
- Tabs support
- Better copy/paste
- Unicode support

**Download**: Microsoft Store → "Windows Terminal"

---

### Run as Administrator (When Needed)

Some operations may require admin privileges:
- Installing pnpm globally
- Enabling long paths
- Port binding (< 1024)

**How**:
1. Right-click `setup.bat`
2. Select "Run as administrator"

---

### Use Short Paths

Install Agor in a short path to avoid Windows path length issues:

**Good**:
```
C:\agor
C:\projects\agor
D:\dev\agor
```

**Bad**:
```
C:\Users\YourName\Documents\My Projects\Work\AI Tools\Agor\agor-platform
```

---

### Check Windows Version

Agor requires Windows 10 (build 1809+) or Windows 11.

**Check version**:
```batch
winver
```

---

### Firewall Rules

Windows Firewall may prompt for Node.js access:
- **Allow** both Private and Public networks
- This is required for UI to connect to daemon

---

## 📊 Performance Tips

### Exclude from Windows Defender

Add Agor folder to exclusions for faster builds:

1. Windows Security → Virus & threat protection
2. Manage settings → Exclusions
3. Add folder → Select Agor directory

**Typical speedup**: 2-3x faster builds

---

### Disable Node.js Debugging

If you don't need debugging, disable to save memory:

```batch
REM In .env, add:
NODE_OPTIONS=--max-old-space-size=4096
```

---

### Use SSD

Install Agor on SSD (not HDD) for:
- 5-10x faster dependency installation
- 2-3x faster builds
- Better dev server performance

---

## 🔐 Security Notes

### API Key Safety

Never commit `.env` file to Git:
- Already in `.gitignore` ✓
- Double-check before commits
- Use separate keys for dev/prod

---

### Run from Trusted Location

Don't run batch files from:
- Downloads folder (may trigger SmartScreen)
- Network drives
- Untrusted sources

---

## 📚 Next Steps

After successful setup:

1. **Read Documentation**:
   - `QUICKSTART.md` - Getting started guide
   - `README.md` - Product overview
   - `CLAUDE.md` - Architecture details

2. **Try the UI**:
   - Open http://localhost:5173
   - Create your first session
   - Explore the canvas

3. **Join Community**:
   - GitHub Discussions
   - Discord (if available)
   - Report issues on GitHub

---

## 🆘 Getting Help

### Check Logs

Development mode logs appear in terminal windows.

**Common log locations**:
- Daemon: Terminal window titled "Agor Daemon"
- UI: Terminal window titled "Agor UI"
- Build errors: Terminal output from batch files

---

### Report Issues

If you encounter issues:

1. **Gather information**:
   ```batch
   REM Check versions
   node --version
   pnpm --version
   git --version

   REM Check OS
   winver
   ```

2. **Include in report**:
   - Windows version
   - Node.js version
   - Error message
   - Steps to reproduce

3. **Submit**: GitHub Issues → https://github.com/yourusername/agor/issues

---

## 📝 Command Reference

### Quick Command Cheat Sheet

```batch
quick-start.bat    # First time: setup + launch
setup.bat          # Install dependencies + build
dev.bat            # Start development servers
start.bat          # Start production server
clean.bat          # Remove build artifacts
reset.bat          # Full reset (nuclear option)
test.bat           # Run test suite

pnpm install       # Install dependencies manually
pnpm build         # Build all packages manually
pnpm dev           # Run all dev servers with Turbo
pnpm test          # Run all tests
```

---

## ✅ Verification Checklist

After running `setup.bat`, verify:

- [ ] Node.js installed (v20.x)
- [ ] pnpm installed
- [ ] Git installed
- [ ] Dependencies installed (`node_modules/` exists)
- [ ] `.env` file exists
- [ ] API keys added to `.env`
- [ ] Build successful (`packages/core/dist/` exists)
- [ ] Dev servers start without errors
- [ ] UI accessible at http://localhost:5173

If all checked, you're ready to use Agor! 🎉

---

**Last Updated**: November 18, 2025
**For More Help**: See `QUICKSTART.md` or `README.md`
