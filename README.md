# LTX Prompter

A friendly, guided prompt wizard for video and creative production. Create professional video prompts with AI assistance, organized project management, and smart suggestions.

**Version:** 1.0.1 | Windows Desktop App | Built with Next.js + React + Electron

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
  - [For Users](#for-users)
  - [For Developers](#for-developers)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Development](#development)
- [Building & Distribution](#building--distribution)
- [Contributing](#contributing)

---

## 🚀 Getting Started

### For Users

#### Installation

1. Download the installer from the [Releases](https://github.com/jamesk9526/LTX-Prompt-Creator/releases) page
2. Run `LTX Prompter Setup.exe`
3. Launch from Start Menu or Desktop shortcut

#### First-Time Setup

1. **Configure Settings** (gear icon)
   - Enable/disable Ollama AI features
   - Set model and endpoint
   - Adjust preferences
<img width="1410" height="894" alt="Screenshot 2026-01-16 230548" src="https://github.com/user-attachments/assets/61d4ae70-1869-4480-a260-4d2d7d79469a" />

2. **Create Your First Project**
   - Click "Projects" button
   - Create new project
   - Select mode and base prompt

---

### For Developers

#### Prerequisites

- Node.js 18+ ([download](https://nodejs.org/))
- Windows OS (for building)
- Git

#### Quick Start

```bash
# Clone repository
git clone https://github.com/jamesk9526/LTX-Prompt-Creator.git
cd ltx_prompter/electron-app

# Install dependencies
npm install

# Run in development mode
npm run dev:electron
```

#### Building

```bash
cd electron-app

# Build Windows installer and portable exe
npm run dist:win
```

Output in `electron-app/release/`:
- `LTX Prompter Setup 1.0.1.exe` — NSIS installer
- `LTX Prompter 1.0.1 x64 Portable.exe` — Standalone executable

---

## ✨ Features

### Core Features
- **Prompt Wizard**: Step-by-step guided prompt creation
- **Multiple Modes**: Cinematic, Classic, Photography, Abstract, Experimental
- **AI Chat Integration**: Optional Ollama integration for AI assistance
- **Project Management**: Organize prompts in projects
- **History Tracking**: Save and manage chat sessions
- **Export Options**: JSON, Markdown, Plain Text

### AI Features (Ollama Integration)
- Real-time chat with AI models
- Smart prompt suggestions
- UI control via natural language
- Action execution (update fields, navigate steps)
- NSFW content filtering
<img width="1044" height="944" alt="Screenshot 2026-01-11 013950" src="https://github.com/user-attachments/assets/e1db44fb-2187-4a4f-b024-3e9e5e986172" />
<img width="590" height="82" alt="Screenshot 2026-01-16 230640" src="https://github.com/user-attachments/assets/cb0743f3-9b14-4080-b083-5db6fbb4988e" />

### Advanced Features
- **Virtualized Chat**: High-performance rendering for 1000+ messages
- **Chat History**: Browse, search, filter, and export conversations
- **Keyboard Shortcuts**: Fast navigation and actions
- **Error Boundaries**: Graceful error handling
- **Auto-save**: Automatic chat session persistence
- **Dark Theme**: Professional dark UI
<img width="590" height="82" alt="Screenshot 2026-01-16 230640" src="https://github.com/user-attachments/assets/419ff485-f0b1-4351-ade6-63b75b43954d" />

---

## 🏗 Architecture

### Application Stack
- **Frontend**: Next.js 15 + React 19
- **Desktop**: Electron 33
- **Language**: TypeScript
- **Styling**: CSS Modules + Global CSS
- **State**: React Hooks + Local Storage
- **IPC**: Electron IPC for main/renderer communication
<img width="1392" height="870" alt="Screenshot 2026-01-16 230658" src="https://github.com/user-attachments/assets/c879df01-5148-4915-b08a-3bc6f74fc85a" />

### Key Components

```
electron-app/
├── app/                      # Next.js application
│   ├── wizard/              # Main prompt wizard
│   │   ├── page.tsx         # Main wizard page
│   │   ├── components/      # TopBar, PreviewSidebar
│   │   └── modals/          # Settings, Ollama panel
│   ├── chat/                # Chat interface (legacy)
│   ├── components/          # Shared React components
│   │   ├── ChatPanel.tsx
│   │   ├── VirtualizedChatPanel.tsx
│   │   ├── ChatHistorySidebar.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── modals/          # Reusable modals
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript definitions
│   └── utils/               # Utilities
│       ├── ChatHistoryManager.ts
│       ├── ActionExecutor.ts
│       ├── logger.ts
│       └── debounce.ts
├── electron/                # Electron main process
│   ├── main.js              # App entry point
│   └── preload.js           # IPC bridge
├── public/                  # Static assets
├── system_prompts/          # AI system prompts
└── package.json
```

### Data Flow

```
User Interface (React)
    ↕ (IPC via preload.js)
Electron Main Process
    ↕
File System / OS APIs
```

### Storage Architecture

- **Local Storage**: Settings, projects, prompts
- **Chat History**: localStorage with 10MB limit
- **Project Data**: JSON files via Electron IPC
- **System Prompts**: File system via Electron

---

## 📁 Project Structure

```
ltx_prompter/
├── electron-app/            # Main application
│   ├── app/                 # Next.js frontend
│   ├── electron/            # Electron backend
│   ├── public/              # Static files
│   ├── release/             # Build output
│   └── package.json
├── LTX-prompter---RAW-Edition/  # Legacy/experimental version
├── README.md                # This file
└── TODO.md                  # Task list
```

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Next.js dev server
npm run dev:electron     # Full Electron app with hot reload

# Building
npm run build           # Build Next.js app
npm run dist:win        # Create Windows installer + portable

# Utilities
npm run clean           # Clean build artifacts
npm run type-check      # Run TypeScript checks
```

### Environment Setup

The app auto-detects Electron environment and configures accordingly. No environment variables required for basic development.

### Debugging

- **React DevTools**: Available in dev mode
- **Chrome DevTools**: Press F12 in the app window
- **Logs**: Check `electron/main.js` console output

### Code Style

- TypeScript strict mode enabled
- ES6+ features
- React functional components with hooks
- CSS Modules for component styles
- Async/await for async operations

---

## 📦 Building & Distribution

### Windows Installer

```bash
cd electron-app
npm run dist:win
```

Creates:
1. NSIS Installer with start menu integration
2. Portable executable (no installation)

### Build Configuration

See `electron-app/package.json` for:
- Electron Builder config
- File inclusion patterns
- Icon and asset management
- NSIS installer options

### Release Checklist

1. Update version in `package.json`
2. Test build locally
3. Run `npm run dist:win`
4. Test installer and portable exe
5. Create GitHub release
6. Upload build artifacts

---

## 🎯 Key Features Implementation

### Chat Virtualization
Uses `react-window` for rendering only visible messages, enabling smooth performance with 1000+ messages.

### Chat History Management
- **Storage**: localStorage with 10MB limit
- **Features**: Save, load, search, filter, export
- **Limits**: 100 sessions maximum
- **Export Formats**: JSON, Markdown, Text

### AI Actions System
Ollama can control UI via structured actions:
- `update_field`: Modify form fields
- `navigate_step`: Change wizard steps
- `set_mode`: Switch between modes
- `apply_preset`: Load prompt presets

### Error Handling
- Error boundaries for component crashes
- Graceful fallbacks for missing data
- User-friendly error messages
- Detailed logging for debugging

---

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Guidelines
- Follow existing code style
- Add TypeScript types for new code
- Test thoroughly before submitting
- Update documentation as needed
- Write meaningful commit messages

### Reporting Issues
- Use GitHub Issues
- Include reproduction steps
- Provide error messages/logs
- Specify OS and version

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Built with Next.js, React, and Electron
- Chat virtualization via react-window
- Icons from Lucide React
- Inspired by creative AI tools

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/jamesk9526/LTX-Prompt-Creator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jamesk9526/LTX-Prompt-Creator/discussions)

---

## 🔄 Version History

### 1.0.1 (Current)
- Chat history implementation
- Virtualized chat rendering
- Performance optimizations
- Error boundary improvements
- UI/UX enhancements

### 1.0.0
- Initial release
- Prompt wizard interface
- Ollama integration
- Project management
- Basic chat functionality

---

**Made with ❤️ for creative professionals**
