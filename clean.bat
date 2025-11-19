@echo off
REM ============================================
REM Agor - Clean Build Artifacts
REM ============================================
REM This script removes all build artifacts and caches
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ================================================
echo    Agor - Clean Build Artifacts
echo ================================================
echo.
echo This will delete:
echo   - All dist/ folders
echo   - All .turbo/ folders
echo   - All node_modules/.cache folders
echo   - All .tsbuildinfo files
echo.
echo Continue? (Y/N)
set /p CONFIRM=

if /i not "%CONFIRM%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo Cleaning build artifacts...
echo.

REM Clean dist folders
echo Removing dist folders...
if exist "packages\core\dist" (
    rmdir /s /q "packages\core\dist"
    echo [OK] Removed packages\core\dist
)
if exist "apps\agor-daemon\dist" (
    rmdir /s /q "apps\agor-daemon\dist"
    echo [OK] Removed apps\agor-daemon\dist
)
if exist "apps\agor-cli\dist" (
    rmdir /s /q "apps\agor-cli\dist"
    echo [OK] Removed apps\agor-cli\dist
)
if exist "apps\agor-ui\dist" (
    rmdir /s /q "apps\agor-ui\dist"
    echo [OK] Removed apps\agor-ui\dist
)
if exist "packages\agor-live\dist" (
    rmdir /s /q "packages\agor-live\dist"
    echo [OK] Removed packages\agor-live\dist
)

REM Clean turbo cache
echo.
echo Removing Turbo cache...
if exist ".turbo" (
    rmdir /s /q ".turbo"
    echo [OK] Removed .turbo
)
if exist "apps\agor-daemon\.turbo" (
    rmdir /s /q "apps\agor-daemon\.turbo"
)
if exist "apps\agor-ui\.turbo" (
    rmdir /s /q "apps\agor-ui\.turbo"
)
if exist "apps\agor-cli\.turbo" (
    rmdir /s /q "apps\agor-cli\.turbo"
)
if exist "packages\core\.turbo" (
    rmdir /s /q "packages\core\.turbo"
)

REM Clean tsbuildinfo
echo.
echo Removing TypeScript build info...
for /r %%f in (*.tsbuildinfo) do (
    del /q "%%f" 2>nul
)
echo [OK] Removed .tsbuildinfo files

REM Clean node_modules cache
echo.
echo Removing node_modules cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo [OK] Removed node_modules\.cache
)
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo [OK] Removed node_modules\.vite
)

echo.
echo ================================================
echo    Clean Complete!
echo ================================================
echo.
echo All build artifacts have been removed.
echo.
echo To rebuild:
echo   - Run: pnpm build
echo.
echo ================================================
echo.

pause
