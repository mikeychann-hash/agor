@echo off
REM ============================================
REM Agor - Quick Start (One-Click Setup + Launch)
REM ============================================
REM This script runs complete setup and launches dev mode
REM Perfect for first-time users!
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ================================================
echo    Agor - Quick Start
echo ================================================
echo.
echo This will:
echo   1. Check prerequisites
echo   2. Install dependencies
echo   3. Setup environment
echo   4. Build packages
echo   5. Launch development servers
echo.
echo This may take 10-15 minutes on first run.
echo.
echo Continue? (Y/N)
set /p CONFIRM=

if /i not "%CONFIRM%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

REM Run setup
echo.
echo Running setup...
echo.
call setup.bat

if %errorLevel% neq 0 (
    echo.
    echo [ERROR] Setup failed!
    echo.
    pause
    exit /b 1
)

REM Check if .env has API keys
echo.
echo Checking for API keys...
echo.

findstr /C:"sk-ant-" .env >nul 2>&1
set HAS_ANTHROPIC=%errorLevel%

findstr /C:"sk-" .env >nul 2>&1
set HAS_OPENAI=%errorLevel%

if %HAS_ANTHROPIC% neq 0 (
    if %HAS_OPENAI% neq 0 (
        echo.
        echo ================================================
        echo    WARNING: No API Keys Found!
        echo ================================================
        echo.
        echo You need to add at least one API key to .env:
        echo   - ANTHROPIC_API_KEY (for Claude Code)
        echo   - OPENAI_API_KEY (for Codex)
        echo   - GEMINI_API_KEY (for Gemini)
        echo.
        echo Open .env file now? (Y/N)
        set /p OPEN_ENV=
        if /i "!OPEN_ENV!"=="Y" (
            notepad .env
            echo.
            echo After adding your API key, press any key to continue...
            pause >nul
        ) else (
            echo.
            echo You can add API keys later by editing .env
            echo.
        )
    )
)

REM Launch dev mode
echo.
echo Launching development servers...
echo.
call dev.bat

pause
