@echo off
REM ============================================
REM Agor - Production Mode Launcher
REM ============================================
REM This script starts Agor in production mode
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ================================================
echo    Agor - Production Mode
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
    echo [ERROR] .env file not found!
    echo.
    echo Please create .env file with your configuration
    echo You can copy .env.example and add your API keys
    echo.
    pause
    exit /b 1
)

REM Check if built
if not exist "packages\core\dist" (
    echo [WARNING] Packages not built!
    echo.
    echo Building now...
    call pnpm build
    if !errorLevel! neq 0 (
        echo.
        echo [ERROR] Build failed!
        pause
        exit /b 1
    )
)

REM Set production environment
set NODE_ENV=production

echo.
echo Starting Agor in production mode...
echo.
echo Daemon will start on: http://localhost:3030
echo UI is served by daemon at: http://localhost:3030
echo.
echo Press Ctrl+C to stop the server.
echo.
echo ================================================
echo.

REM Start daemon
cd apps\agor-daemon

echo Starting daemon...
call pnpm start

REM If we get here, daemon stopped
echo.
echo Daemon stopped.
echo.
pause
