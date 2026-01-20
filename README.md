# LTX Prompter

A professional desktop app for creating video prompts with AI assistance. Build cinematic prompts step-by-step with Ollama integration, project management, and smart suggestions.

**Version:** 1.2.0 | Windows Desktop App | Built with Next.js + React + Electron

---

## 📋 Quick Navigation

- [Getting Started](#getting-started) - Installation and first steps
- [Features](#features) - What the app can do
- [Development](#development) - For developers
- [Documentation](#documentation) - Technical details

**📚 For detailed technical information, see [INFO.md](INFO.md)**

---

## 🚀 Getting Started

### Installation

1. Download the installer from the [Releases](https://github.com/jamesk9526/LTX-Prompt-Creator/releases) page
2. Run `LTX Prompter Setup.exe`
3. Launch from Start Menu or Desktop shortcut

### First Steps

1. **Configure Settings** (⚙️ gear icon)
   - Enable/disable Ollama AI features
   - Set model and endpoint
   - Adjust preferences

2. **Create Your First Project**
   - Click "Projects" button
   - Create new project
   - Select mode (Cinematic, Classic, Photography, etc.)
   - Start building prompts step-by-step

---

## ✨ Features

### Core Features
- **Prompt Wizard** - Step-by-step guided prompt creation
- **Multiple Modes** - Cinematic, Classic, Photography, Abstract, Experimental
- **AI Chat** - Optional Ollama integration for assistance
- **Projects** - Organize prompts in projects
- **History** - Save and manage chat sessions
- **Export** - JSON, Markdown, Plain Text

### AI Features (Optional Ollama)
- Real-time chat with AI models
- Smart prompt suggestions
- Quality analysis (0-100 score)
- UI control via natural language
- NSFW content filtering

### Advanced Features
- **Virtualized Chat** - Smooth performance with 1000+ messages
- **Chat History** - Browse, search, and export conversations
- **Keyboard Shortcuts** - Fast navigation
- **Error Handling** - Graceful error boundaries
- **Auto-save** - Automatic persistence

---

## 💻 Development

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org/))
- Windows OS (for building Windows installer)
- Git

### Quick Start

```bash
# Clone repository
git clone https://github.com/jamesk9526/LTX-Prompt-Creator.git
cd LTX-Prompt-Creator/electron-app

# Install dependencies
npm install

# Run in development mode
npm run dev:electron
```

### Available Commands

```bash
npm run dev              # Next.js dev server
npm run dev:electron     # Full Electron app with hot reload
npm run build            # Build Next.js app
npm run dist:win         # Create Windows installer
npm run test             # Run all tests
npm run lint             # Run ESLint
```

### Building

```bash
cd electron-app
npm run dist:win
```

Output in `electron-app/release/`:
- `LTX Prompter Setup 1.2.0.exe` — NSIS installer
- `LTX Prompter 1.2.0 x64 Portable.exe` — Standalone executable

---

## 📚 Documentation

- **[INFO.md](INFO.md)** - Complete technical documentation
- **[TODO.md](TODO.md)** - Roadmap and planned features
- **[Issues](https://github.com/jamesk9526/LTX-Prompt-Creator/issues)** - Bug reports and feature requests

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

**See [INFO.md](INFO.md) for development guidelines and code style.**

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- Built with Next.js, React, and Electron
- Chat virtualization via react-window
- Icons from Lucide React

---

**Made with ❤️ for creative professionals**
