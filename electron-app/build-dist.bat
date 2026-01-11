@echo off
REM Build and prepare the distribution folder
REM This script runs: npm run build-dist
REM Then displays the dist folder location and next steps

echo.
echo ========================================
echo    LTX Prompter - Build Dist Script
echo ========================================
echo.

cd /d "%~dp0"

echo Building Next.js and preparing dist folder...
echo.

call npm run build-dist

echo.
echo ========================================
echo    Build Complete!
echo ========================================
echo.
echo Distribution folder: %CD%\dist
echo.
echo Next steps:
echo   1. Navigate to the dist folder:
echo      cd dist
echo   2. Run the app:
echo      run.bat
echo.
echo Or double-click: dist\run.bat
echo.
echo To share: Zip the entire dist\ folder
echo ========================================
echo.

pause
