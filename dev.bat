@echo off
REM ============================================
REM Agor - Development Mode Launcher
REM ============================================
REM This script starts both daemon and UI in development mode
REM with hot-reload enabled
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ================================================
echo    Agor - Development Mode
echo ================================================
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo [ERROR] Dependencies not installed!
    echo.
    echo Please run: setup.bat
    echo.
    pause
    exit /b 1
)

REM Check if .env exists
if not exist ".env" (
    echo [WARNING] .env file not found
    echo.
    echo Creating .env from .env.example...
    if exist ".env.example" (
        copy .env.example .env >nul
        echo [OK] .env file created
        echo.
        echo IMPORTANT: Add your API keys to .env file before starting
        echo.
        notepad .env
    ) else (
        echo [ERROR] .env.example not found!
        pause
        exit /b 1
    )
)

echo.
echo Starting Agor in development mode...
echo.
echo This will start:
echo   - Daemon (backend) on http://localhost:3030
echo   - UI (frontend) on http://localhost:5173
echo.
echo Both services will auto-reload on file changes.
echo.
echo Press Ctrl+C to stop all services.
echo.
echo ================================================
echo.

REM Create a temporary directory for logs
if not exist "logs" mkdir logs

REM Start daemon in a new window
echo Starting daemon...
start "Agor Daemon" cmd /k "cd apps\agor-daemon && pnpm dev"

REM Wait a bit for daemon to start
timeout /t 3 /nobreak >nul

REM Start UI in a new window
echo Starting UI...
start "Agor UI" cmd /k "cd apps\agor-ui && pnpm dev"

echo.
echo ================================================
echo    Services Started!
echo ================================================
echo.
echo Two windows opened:
echo   1. Agor Daemon (backend)
echo   2. Agor UI (frontend)
echo.
echo Wait ~30 seconds for initial build, then:
echo.
echo   Open: http://localhost:5173
echo.
echo To stop all services:
echo   - Close both terminal windows
echo   - Or press Ctrl+C in each window
echo.
echo ================================================
echo.

pause
