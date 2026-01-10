@echo off
setlocal enabledelayedexpansion

REM LTX Prompter - Auto-Install & Launch
REM This script checks for Node.js and installs if needed, then runs the app

color 0A
title LTX Prompter Launcher
cls

echo.
echo ============================================
echo   LTX Prompter - Initializing...
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [*] Node.js not found. Installing...
    echo.
    
    REM Download Node.js LTS
    echo [*] Downloading Node.js LTS (this may take a minute)...
    powershell -Command "^
        $url = 'https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi'; ^
        $output = '%TEMP%\node-installer.msi'; ^
        $progressPreference = 'silentlyContinue'; ^
        Invoke-WebRequest -Uri $url -OutFile $output; ^
        Write-Host '[+] Download complete'; ^
        Start-Process msiexec.exe -ArgumentList '/i', $output, '/quiet', '/norestart' -Wait; ^
        Remove-Item $output -Force; ^
        Write-Host '[+] Node.js installed successfully'
    "
    
    REM Refresh PATH
    for /f "tokens=2,*" %%A in ('reg query HKCU\Environment /v PATH') do set "PATH=%%B"
    for /f "tokens=2,*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH') do set "PATH=!PATH!;%%B"
    
    cls
    echo [+] Node.js installed
    echo.
)

REM Verify Node.js and npm
echo [*] Verifying Node.js installation...
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo [+] Node.js %NODE_VERSION%
echo [+] npm %NPM_VERSION%
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo [*] Installing dependencies (this may take 2-3 minutes)...
    echo.
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo.
        echo [!] Error installing dependencies
        pause
        exit /b 1
    )
    echo.
    cls
    echo [+] Dependencies installed
    echo.
)

REM Build Next.js if needed
if not exist "out" (
    echo [*] Building application...
    call npm run build
    if %ERRORLEVEL% neq 0 (
        echo.
        echo [!] Error building application
        pause
        exit /b 1
    )
    cls
    echo [+] Application built
    echo.
)

REM Launch Electron app
echo ============================================
echo   [+] Launching LTX Prompter...
echo ============================================
echo.
echo   Press Ctrl+C to stop the app
echo.
timeout /t 2 /nobreak

call npm run dev:electron

REM If the app closes, show a message
echo.
echo ============================================
echo   [*] LTX Prompter has closed
echo ============================================
echo.
pause

endlocal
