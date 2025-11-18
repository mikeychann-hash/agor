@echo off
REM ============================================
REM Agor - Run Tests
REM ============================================
REM This script runs all tests across the monorepo
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ================================================
echo    Agor - Test Runner
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

echo Running all tests...
echo.
echo This may take a few minutes...
echo.

REM Run tests with Turbo
call pnpm test

if %errorLevel% neq 0 (
    echo.
    echo ================================================
    echo    Tests Failed!
    echo ================================================
    echo.
    echo Please review the errors above.
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo ================================================
    echo    All Tests Passed!
    echo ================================================
    echo.
)

pause
