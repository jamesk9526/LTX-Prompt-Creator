@echo off
setlocal enabledelayedexpansion

REM LTX Prompter - Quick CMD Launcher
REM Simpler version that just launches the dev server in command window

color 0A
title LTX Prompter - Command Line
cls

echo.
echo ============================================
echo   LTX Prompter - CMD Launcher
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] Node.js is required but not installed
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Get versions
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo [+] Found Node.js %NODE_VERSION%
echo [+] Found npm %NPM_VERSION%
echo.

REM Change to app directory
cd /d "%~dp0" >nul 2>&1

REM Install/update dependencies if node_modules missing
if not exist "node_modules" (
    echo [*] Installing dependencies...
    call npm install --prefer-offline
    echo.
)

REM Build if out folder missing
if not exist "out" (
    echo [*] Building application...
    call npm run build
    echo.
)

REM Launch dev server
echo ============================================
echo   [+] Launching LTX Prompter
echo ============================================
echo.
echo   The application will open in a new window
echo   Terminal: Ctrl+C to stop the server
echo   App: Click the X button to close
echo.
timeout /t 2 /nobreak
echo.

call npm run dev:electron

endlocal
