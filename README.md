# LTX Prompter

A friendly, guided prompt wizard for video and creative production. Create professional video prompts with AI assistance, organized project management, and smart suggestions.

**Status:** Version 1.0.1 | Windows Desktop App | Built with Next.js + React + Electron

---

## Table of Contents

- [Getting Started](#getting-started)
  - [For Users](#for-users)
  - [For Developers](#for-developers)
- [How to Use the App](#how-to-use-the-app)
- [Source Code Guide](#source-code-guide)
- [Contributing & Support](#contributing--support)

---

## Getting Started

### For Users

#### Installation

1. **Download the installer** from the [Releases](https://github.com/jamesk9526/LTX-Prompt-Creator/releases) page
2. **Run the installer** (`LTX Prompter Setup.exe`)
3. **Launch the app** from your Start Menu or Desktop shortcut

#### Running the App

- Simply click the app shortcut or search for "LTX Prompter" in Windows
- The app window opens automatically with the prompt wizard

#### First-Time Setup

1. **Review Settings** (gear icon in top-right)
   - Enable/disable Ollama for AI features
   - Configure model and endpoint if using Ollama
   - Adjust other preferences

2. **Create Your First Project** (Projects button in top bar)
   - Click "New Project"
   - Name your project
   - Select a mode and base prompt

---

### For Developers

#### Prerequisites

- **Node.js** 18+ ([download here](https://nodejs.org/))
- **Windows** (for building; Electron development requires native Windows tools)
- **Git** for cloning the repo

#### Quick Start (Development)

```bash
# Clone and navigate
git clone https://github.com/jamesk9526/LTX-Prompt-Creator.git
cd ltx_prompter/electron-app

# Install dependencies
npm install

# Run in development mode with live reload
npm run dev:electron
```

The app opens automatically. Changes to React/Next.js code auto-refresh in the window.

#### Building the Installer

```bash
cd electron-app

# Clean, build, and create Windows installer + portable exe
npm run dist:win
```

Output files are in `electron-app/release/`:
- `LTX Prompter Setup 1.0.1.exe` — Full NSIS installer with uninstaller
- `LTX Prompter 1.0.1 x64 Portable.exe` — Standalone, no installation required

#### Project Structure

```
electron-app/
├── app/                      # Next.js application
│   ├── wizard/page.tsx       # Main prompt wizard interface
│   ├── chat/page.tsx         # Chat/AI conversation view
│   ├── components/           # Reusable React components
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── globals.css          # Global styles
├── electron/                # Electron main process & IPC
│   ├── main.js              # App entry point
│   ├── preload.js           # IPC bridge
│   └── server.js            # Backend server
├── public/                  # Static assets
├── docs/                    # Documentation
├── tests/                   # Test files
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

#### Available Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Run Next.js dev server only |
| `npm run dev:electron` | Run with Electron app window |
| `npm run build` | Build Next.js app for production |
| `npm run dist:win` | Build Windows installer + portable |
| `npm run dist:mac` | Build macOS DMG/ZIP |
| `npm run dist:linux` | Build Linux AppImage/DEB |
| `npm run clean` | Clean build artifacts |
| `npm run lint` | Run ESLint |
| `npm run icons` | Regenerate app icons |

#### Development Workflow

1. **Make changes** to code in `app/` or `electron/`
2. **See updates** automatically in the Electron window
3. **Test features** using the dev app
4. **Run tests** with `npm run test:natural`
5. **Build for release** with `npm run dist:win`

#### Tech Stack

- **Frontend:** React 18 + Next.js 14 (TypeScript)
- **Desktop:** Electron 29
- **Build:** Electron Builder
- **Styling:** CSS modules + globals
- **Type Safety:** TypeScript with strict checks

#### Troubleshooting Development

**Port 3000 already in use?**
```bash
# Kill the process using port 3000 and try again
# Or manually change the port in package.json dev script
```

**Electron window won't open?**
- Check that Next.js dev server started successfully
- Look for errors in the terminal
- Run `npm run clean` and try again

**Build fails?**
- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be 18+)
- Try cleaning: `npm run clean && npm run build`

---

## How to Use the App

### Main Features

#### 1. **The Wizard** (Main Interface)

The prompt wizard guides you through creating detailed video production prompts step-by-step.

- **Step Navigation** — Use the top bar or Step buttons to navigate
- **Modes** — Switch between different prompt types (Default, Cinematic, Technical, etc.)
- **Live Preview** — See your prompt build in real-time
- **Tone Selection** — Choose emotional tone (upbeat, serious, melancholic, etc.)

#### 2. **Projects**

Manage and organize your prompts as projects.

**Create a Project:**
1. Click **Projects** button (top bar)
2. Click **New Project**
3. Enter a name and select a starting template
4. Click Create

**Load a Project:**
1. Click **Projects**
2. Select a project from the list
3. Click Load (or double-click the project name)

**Save/Export:**
- Changes auto-save to the project
- Click **Export** to save as JSON file for backup or sharing
- Click **Delete** to remove a project

**Import:**
- Click **Import** and select a previously exported JSON file
- Restores all prompt data

#### 3. **Chat & AI Features**

Get AI assistance for prompt refinement and expansion.

**Enable AI Features:**
1. Click **Settings** (gear icon, top-right)
2. Check **Enable Ollama**
3. Select a model from the dropdown
4. Verify the endpoint (default: `http://localhost:11434`)

**Using AI:**
- **Chat Panel** — Send messages to an AI model for ideas and feedback
- **AI Refiner** — Get specific suggestions to improve your prompt
- **Auto-Refine** — Let AI completely revise your prompt
- **Ollama Expand** — Expand the current prompt using your selected model

**AI Suggestion Categories:**
- 🎯 **Specificity** — Add concrete details instead of vague language
- ✨ **Details** — Include technical or visual specifics
- ❤️ **Emotion** — Strengthen emotional impact
- ⚙️ **Technical** — Add cinematography details
- 🎭 **Tone** — Align with selected mood
- 📐 **Structure** — Improve logical flow

#### 4. **Settings**

Configure app behavior and AI integration.

**Available Settings:**
- **Ollama Integration** — Enable/disable, set endpoint and model
- **Auto-Save** — Enable/disable automatic project saving
- **Theme** — Light/Dark mode preferences
- **App Preferences** — Various UI and behavior options

#### 5. **System Prompts**

Pre-built prompts guide the AI behavior for different creative contexts. Access them in the Chat view or through Settings.

### Typical Workflow

1. **Start the app** and click **Projects**
2. **Create a new project** or load an existing one
3. **Navigate through the wizard steps** (Mode → Tone → Elements → Details)
4. **Build your prompt** using the provided fields
5. **Preview** your prompt in the main text area
6. **Refine** using AI suggestions (if Ollama is enabled)
7. **Chat** with the AI for feedback or ideas
8. **Export** when done or save for later

### Installing Ollama (For AI Features)

If you want to use AI-powered features:

1. **Download Ollama** from https://ollama.com/
2. **Install and run it**
3. **Pull a model** in Ollama:
   ```bash
   ollama pull llama3
   ```
4. **In LTX Prompter Settings:**
   - Enable Ollama
   - Select your model
   - Keep endpoint as `http://localhost:11434`

Popular models: `llama3`, `mistral`, `neural-chat`, `dolphin-mixtral`

---

## Source Code Guide

### Key Files & Directories

#### App Pages
- `app/wizard/page.tsx` — Main prompt creation interface
- `app/chat/page.tsx` — Chat interface with AI
- `app/page.tsx` — Home/landing page

#### Components
- `app/components/ChatPanel.tsx` — Chat UI and message rendering
- `app/components/ProjectsModal.tsx` — Project management interface
- `app/components/Toast.tsx` — Notification system

#### Hooks
- `app/hooks/` — Custom React hooks for state management

#### Utilities
- `app/utils/` — Helper functions for prompt building, AI integration, storage

#### Electron
- `electron/main.js` — Electron main process, window creation
- `electron/preload.js` — IPC bridge for secure communication
- `electron/server.js` — Backend API (if applicable)

### Adding Features

**To add a new component:**
1. Create file in `app/components/YourComponent.tsx`
2. Use TypeScript for type safety
3. Follow existing component patterns
4. Import and use in pages

**To add a new page:**
1. Create directory in `app/your-page/`
2. Add `page.tsx` inside
3. Router automatically adds `/your-page` route

**To modify the wizard:**
1. Edit `app/wizard/page.tsx`
2. Add new step sections or fields
3. Update types in `app/types/` if needed

### Testing

```bash
# Run natural language validation tests
npm run test:natural

# Other test commands in package.json
```

### Documentation

Check `electron-app/docs/` for detailed guides:
- `START_HERE.md` — Component refactoring overview
- `AI_FEATURES_GUIDE.md` — AI integration details
- `COMPONENT_ARCHITECTURE.md` — Technical architecture
- `QUICK_REFERENCE_GUIDE.md` — Common tasks cheatsheet

---

## Contributing & Support

### Report Issues

Found a bug? Have a feature request?
- **GitHub Issues:** https://github.com/jamesk9526/LTX-Prompt-Creator/issues

### Support the Project

- **Repository:** https://github.com/jamesk9526/LTX-Prompt-Creator
- **Tip Jar:** https://ko-fi.com/jamesknox

### License

MIT License — Feel free to use, modify, and distribute

---

## FAQ

**Q: Do I need Ollama?**
A: No, the app works without it. Ollama is optional and enables AI-powered features like suggestions and expansion.

**Q: Can I use this on Mac/Linux?**
A: The codebase supports it, but distribution builds are currently Windows-focused. Developers can build for Mac/Linux with `npm run dist:mac` or `npm run dist:linux`.

**Q: Where are my projects saved?**
A: Projects are stored locally in your user directory (Windows AppData). Use Export/Import to back them up or share them.

**Q: How do I request a feature?**
A: Open an issue on GitHub with `[FEATURE REQUEST]` in the title.

**Q: Can I modify the system prompts?**
A: Yes, they're in `electron-app/system_prompts/`. Edit and the app will use your changes.

---

**Last Updated:** January 2026 | Version 1.0.1
