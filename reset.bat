@echo off
REM ============================================
REM Agor - Full Reset Script
REM ============================================
REM This script performs a complete clean reset:
REM - Removes all node_modules
REM - Removes all build artifacts
REM - Clears all caches
REM - Reinstalls dependencies
REM - Rebuilds all packages
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ================================================
echo    Agor - Full Reset
echo ================================================
echo.
echo WARNING: This will completely reset your installation!
echo.
echo This will:
echo   1. Delete ALL node_modules folders
echo   2. Delete ALL build artifacts (dist, .turbo, etc.)
echo   3. Clear pnpm cache
echo   4. Reinstall all dependencies
echo   5. Rebuild all packages
echo.
echo This process may take 10-15 minutes.
echo.
echo Continue? (Y/N)
set /p CONFIRM=

if /i not "%CONFIRM%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo ================================================
echo Starting full reset...
echo ================================================
echo.

REM Step 1: Clean build artifacts
echo [1/5] Cleaning build artifacts...
call clean.bat

REM Step 2: Remove node_modules
echo.
echo [2/5] Removing node_modules...
echo       This may take a few minutes...
echo.

if exist "node_modules" (
    rmdir /s /q "node_modules"
    echo [OK] Removed root node_modules
)

REM Remove node_modules from all packages
for /d %%d in (apps\*, packages\*) do (
    if exist "%%d\node_modules" (
        echo Removing %%d\node_modules...
        rmdir /s /q "%%d\node_modules"
    )
)

echo [OK] All node_modules removed

REM Step 3: Clear pnpm cache
echo.
echo [3/5] Clearing pnpm cache...
call pnpm store prune
echo [OK] pnpm cache cleared

REM Step 4: Reinstall dependencies
echo.
echo [4/5] Reinstalling dependencies...
echo       This may take 5-10 minutes...
echo.

call pnpm install
if %errorLevel% neq 0 (
    echo.
    echo [ERROR] Failed to reinstall dependencies!
    echo.
    echo Try running manually: pnpm install --force
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies reinstalled

REM Step 5: Rebuild all packages
echo.
echo [5/5] Rebuilding all packages...
echo       This may take 2-3 minutes...
echo.

call pnpm build
if %errorLevel% neq 0 (
    echo.
    echo [WARNING] Build completed with errors
    echo.
) else (
    echo.
    echo [OK] Build completed successfully
)

echo.
echo ================================================
echo    Reset Complete!
echo ================================================
echo.
echo Your Agor installation has been completely reset.
echo.
echo Next steps:
echo   1. Verify .env has your API keys
echo   2. Run: dev.bat (for development)
echo   3. Or: start.bat (for production)
echo.
echo ================================================
echo.

pause
