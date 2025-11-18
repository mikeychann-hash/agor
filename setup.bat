@echo off
REM ============================================
REM Agor - Initial Setup Script for Windows
REM ============================================
REM This script will:
REM 1. Check for required prerequisites (Node.js, pnpm)
REM 2. Install all dependencies
REM 3. Create .env file from template
REM 4. Build all packages
REM 5. Verify installation
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ================================================
echo    Agor - Initial Setup
echo ================================================
echo.

REM Check if running as administrator (optional but recommended)
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running with administrator privileges
) else (
    echo [WARNING] Not running as administrator
    echo           Some operations may fail if npm global installs are restricted
    echo.
)

REM ============================================
REM Step 1: Check Prerequisites
REM ============================================
echo.
echo [STEP 1/5] Checking prerequisites...
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js v20.x from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js installed: %NODE_VERSION%

REM Check if Node.js version is v20.x
echo %NODE_VERSION% | findstr /C:"v20." >nul
if %errorLevel% neq 0 (
    echo [WARNING] Agor requires Node.js v20.x
    echo           You have: %NODE_VERSION%
    echo           Continue anyway? (Y/N)
    set /p CONTINUE=
    if /i not "!CONTINUE!"=="Y" (
        echo Setup cancelled.
        pause
        exit /b 1
    )
)

REM Check pnpm
pnpm --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [WARNING] pnpm is not installed
    echo.
    echo Installing pnpm globally...
    call npm install -g pnpm@9.15.1
    if !errorLevel! neq 0 (
        echo [ERROR] Failed to install pnpm
        pause
        exit /b 1
    )
    echo [OK] pnpm installed successfully
) else (
    for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VERSION=%%i
    echo [OK] pnpm installed: v!PNPM_VERSION!
)

REM Check Git
git --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [WARNING] Git is not installed
    echo           Git is required for repository management
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo.
    echo Continue without Git? (Y/N)
    set /p CONTINUE=
    if /i not "!CONTINUE!"=="Y" (
        echo Setup cancelled.
        pause
        exit /b 1
    )
) else (
    for /f "tokens=*" %%i in ('git --version') do set GIT_VERSION=%%i
    echo [OK] Git installed: !GIT_VERSION!
)

REM ============================================
REM Step 2: Install Dependencies
REM ============================================
echo.
echo [STEP 2/5] Installing dependencies...
echo           This may take 5-10 minutes on first run...
echo.

call pnpm install
if %errorLevel% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies
    echo.
    echo Try running: pnpm install --force
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies installed successfully
echo.

REM ============================================
REM Step 3: Setup Environment Variables
REM ============================================
echo.
echo [STEP 3/5] Setting up environment configuration...
echo.

if not exist ".env" (
    if exist ".env.example" (
        echo Creating .env file from .env.example...
        copy .env.example .env >nul
        echo [OK] .env file created
        echo.
        echo IMPORTANT: You need to add your API keys to .env file:
        echo   - ANTHROPIC_API_KEY (for Claude Code)
        echo   - OPENAI_API_KEY (for Codex)
        echo   - GEMINI_API_KEY (for Gemini)
        echo.
        echo Open .env file now? (Y/N)
        set /p OPEN_ENV=
        if /i "!OPEN_ENV!"=="Y" (
            notepad .env
        )
    ) else (
        echo [WARNING] .env.example not found
        echo           You may need to create .env manually
    )
) else (
    echo [OK] .env file already exists
)

echo.

REM ============================================
REM Step 4: Build All Packages
REM ============================================
echo.
echo [STEP 4/5] Building all packages...
echo           This may take 2-3 minutes...
echo.

call pnpm build
if %errorLevel% neq 0 (
    echo.
    echo [WARNING] Build completed with errors
    echo           You may need to fix issues before running
    echo.
    echo Continue anyway? (Y/N)
    set /p CONTINUE=
    if /i not "!CONTINUE!"=="Y" (
        echo Setup cancelled.
        pause
        exit /b 1
    )
) else (
    echo.
    echo [OK] Build completed successfully
)

echo.

REM ============================================
REM Step 5: Verify Installation
REM ============================================
echo.
echo [STEP 5/5] Verifying installation...
echo.

REM Check if core package was built
if exist "packages\core\dist" (
    echo [OK] @agor/core built successfully
) else (
    echo [WARNING] @agor/core dist not found
)

REM Check if daemon was built
if exist "apps\agor-daemon\dist" (
    echo [OK] @agor/daemon built successfully
) else (
    echo [WARNING] @agor/daemon dist not found
)

REM Check if CLI was built
if exist "apps\agor-cli\dist" (
    echo [OK] @agor/cli built successfully
) else (
    echo [WARNING] @agor/cli dist not found
)

echo.

REM ============================================
REM Setup Complete
REM ============================================
echo.
echo ================================================
echo    Setup Complete!
echo ================================================
echo.
echo Next steps:
echo.
echo 1. Add your API keys to .env file:
echo    - ANTHROPIC_API_KEY (for Claude Code)
echo    - OPENAI_API_KEY (for Codex)
echo    - GEMINI_API_KEY (for Gemini)
echo.
echo 2. Start development servers:
echo    - Run: dev.bat
echo.
echo 3. Or start production build:
echo    - Run: start.bat
echo.
echo For more information, see QUICKSTART.md
echo.
echo ================================================
echo.

pause
