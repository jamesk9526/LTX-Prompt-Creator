# 🚀 LTX Prompter - Getting Started

## Quick Start Options

### **Option 1: Windows Installer (Recommended for End Users)**
Simply download and run one of the installers from the `release/` folder:
- `LTX Prompter Setup 1.0.0.exe` - Full installer with uninstaller
- `LTX Prompter 1.0.0.exe` - Portable (no installation required)

**Benefits:**
- ✅ No setup required
- ✅ No dependencies needed
- ✅ Works on any Windows machine
- ✅ Professional installer experience

---

### **Option 2: Batch File Launcher (RUN_APP.bat)**
Double-click `RUN_APP.bat` in this folder.

**What it does:**
1. Checks if Node.js is installed
2. If not found, automatically downloads and installs Node.js LTS
3. Installs npm dependencies
4. Builds the application
5. Launches the Electron app

**Benefits:**
- ✅ Automatic Node.js installation
- ✅ No manual setup needed
- ✅ Shows progress in real-time

**Requirements:**
- Windows 7 or later
- Internet connection (first run only)
- ~500MB free disk space

**First Run:** Takes 3-5 minutes (Node.js download + install + build)
**Subsequent Runs:** 10-30 seconds

---

### **Option 3: Command Line Launcher (RUN_CMD.bat)**
Double-click `RUN_CMD.bat` in this folder.

**What it does:**
1. Verifies Node.js is installed
2. Installs dependencies if needed
3. Builds the app if needed
4. Launches the Electron app with a visible console window

**Benefits:**
- ✅ Shows all console output
- ✅ Good for development/debugging
- ✅ Press Ctrl+C in terminal to stop

**Requirements:**
- Node.js must already be installed (won't auto-install)
- [Download Node.js](https://nodejs.org/) if not installed

---

### **Option 4: Manual Command Line**
Open Command Prompt or PowerShell in this folder and run:

```bash
npm install
npm run build
npm run dev:electron
```

---

## Troubleshooting

### **App won't start - "Node is not recognized"**
The Node.js installer didn't complete. Solutions:
1. Use `RUN_APP.bat` which auto-installs Node.js
2. Manually install Node.js from https://nodejs.org/
3. Restart your computer after installing Node.js

### **Port already in use (Error: listen EADDRINUSE)**
The dev server port is taken. The app will automatically try the next available port (3001, 3002, etc.)

### **Blank window or "Cannot GET /"**
The build didn't complete. Try:
1. Delete the `out/` folder
2. Delete the `node_modules/` folder
3. Run one of the batch files again

### **"npm: command not found"**
Node.js/npm isn't installed or not in PATH:
1. Manually install from https://nodejs.org/
2. Restart your computer
3. Try again

### **Installer fails on Windows 7**
Use the Portable `.exe` instead - it doesn't require installation:
- `LTX Prompter 1.0.0.exe` (portable version)

---

## What Each Launcher Does

| Launcher | Auto Node.js? | Shows Console? | First Run Time | Best For |
|----------|--------------|----------------|---------|----------|
| `RUN_APP.bat` | ✅ Yes | ✅ Yes | 3-5 min | Most users |
| `RUN_CMD.bat` | ❌ No | ✅ Yes | 30 sec | Developers |
| Windows Installer | ❌ N/A | ❌ No | - | End users |
| Manual CLI | ❌ No | ✅ Yes | 30 sec | Developers |

---

## Build Outputs

After running a launcher, you'll find:

- `node_modules/` - npm dependencies
- `out/` - Compiled static web files
- `release/` - Windows installers (NSIS + portable .exe)

---

## System Requirements

- **Windows:** 7, 8, 10, 11 (x64)
- **RAM:** 512MB minimum, 2GB recommended
- **Disk:** ~500MB (Node.js + dependencies + app)
- **Internet:** Required for first-time setup only

---

## Advanced Usage

### Development Mode
Edit files in `app/` and changes will hot-reload. Run:
```bash
npm run dev:electron
```

### Build Production Installers
```bash
npm run build
npm run dist:win
```

### Clean Build
```bash
rm -r node_modules out release
npm install
npm run build
npm run dist:win
```

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Try using `RUN_APP.bat` first (handles most issues automatically)
3. Ensure you have 500MB free disk space
4. Check that your internet connection is active during setup

---

**Enjoy LTX Prompter!** 🎉
