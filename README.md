# LTX Prompter

<div align="center">

![LTX Prompter Banner](https://github.com/user-attachments/assets/2bff5843-d343-4bb9-afed-6de94a39b9c7)

**A modern, professional desktop app for creating video prompts with AI assistance**

[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](https://github.com/jamesk9526/LTX-Prompt-Creator/releases)
[![Platform](https://img.shields.io/badge/platform-Windows-blue.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Built with](https://img.shields.io/badge/built%20with-Next.js%20%2B%20Electron-blueviolet.svg)]()

[🚀 Getting Started](#-getting-started) • [✨ Features](#-features) • [📸 Screenshots](#-screenshots) • [💻 Development](#-development) • [📚 Documentation](#-documentation)

</div>

---

## 🎯 What is LTX Prompter?

LTX Prompter is a **beautifully designed desktop application** that helps you craft professional video prompts for AI models. With its intuitive step-by-step wizard, optional AI assistance, and powerful project management, creating high-quality prompts has never been easier.

### ✨ Why LTX Prompter?

- 🎨 **Modern, Clean UI** - Fresh light theme with customizable accent colors
- 🎨 **Personalize Your Experience** - Choose from 10 beautiful accent colors in settings
- 🧠 **AI-Powered** - Optional Ollama integration for intelligent suggestions
- 📝 **Step-by-Step Wizard** - Guided prompt creation with 10 comprehensive steps
- 🎬 **Multiple Modes** - Cinematic, Classic, Photography, Drone, Animation
- 💾 **Project Management** - Organize and save your prompts efficiently
- 📊 **CSV Export** - Batch prompt creation and management
- ⌨️ **Keyboard Shortcuts** - Fast navigation for power users
- 🔒 **Privacy First** - All data stored locally, no cloud required

---

## 📸 Screenshots

### Welcome Screen
![Welcome Screen](https://github.com/user-attachments/assets/34251b89-0f23-4aed-bec3-4f40121e3e80)
*Clean, modern light theme with smooth animations and friendly onboarding*

### Main Wizard Interface
![Main Interface](https://github.com/user-attachments/assets/d94ad6b3-5bfa-4691-a594-2e1bc3add159)
*Intuitive workspace with clear organization and easy-to-read interface*

### Settings & Accent Color Customization
![Settings Modal](https://github.com/user-attachments/assets/187cb2fd-7197-4d88-a3a6-d3710e2f2d15)
*Comprehensive settings with customizable accent colors - choose from 10 beautiful color presets*

---

## 🚀 Getting Started

### Installation

#### Windows
1. Download the latest installer from the [Releases](https://github.com/jamesk9526/LTX-Prompt-Creator/releases) page
2. Run `LTX Prompter Setup.exe`
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

#### macOS & Linux
*Coming soon!*

### First Launch

1. **Welcome Screen** - The app greets you with a friendly introduction
2. **Quick Setup** - Answer a few questions to set your preferences
3. **Start Creating** - Begin building your first prompt immediately

### Basic Workflow

```
1. Choose your mode (Cinematic, Photography, etc.)
   ↓
2. Follow the step-by-step wizard
   ↓
3. Fill in each step (Scene, Subject, Action, etc.)
   ↓
4. Review and refine your prompt
   ↓
5. Export or save to project
```

---

## ✨ Features

### 🎬 Prompt Wizard

**10-Step Guided Creation Process:**
1. **Scene Setup** - Set the foundation for your prompt
2. **Subject & Character** - Define who or what is in focus
3. **Action & Movement** - Describe the motion and dynamics
4. **Visual Style** - Set the aesthetic and mood
5. **Camera & Composition** - Control framing and perspective
6. **Audio & Atmosphere** - Add sound and environmental details
7. **Enhancement & Effects** - Polish with special effects
8. **Advanced Options** - Fine-tune with advanced settings
9. **Context & Timing** - Add temporal and contextual details
10. **Review & Generate** - Final review and export

### 🤖 AI Assistance (Optional)

**Powered by Ollama:**
- **Smart Suggestions** - Get AI-powered prompt improvements
- **Quality Analysis** - Receive a 0-100 quality score
- **Natural Language Control** - Control the UI with voice commands
- **Style Transfer** - Apply styles from reference prompts
- **NSFW Filtering** - Automatic content filtering

**Supported Models:**
- llama2, llama3
- mistral, mixtral
- phi, gemma
- And any other Ollama-compatible model

### 📁 Project Management

- **Create Projects** - Organize prompts by theme or client
- **Save Variations** - Keep multiple versions of prompts
- **Quick Access** - Recently used projects at your fingertips
- **Import/Export** - Share projects with others
- **Search & Filter** - Find prompts quickly

### 🎨 Multiple Modes

Each mode is optimized for different use cases:

| Mode | Best For | Style |
|------|----------|-------|
| **Cinematic** | Film & Video | Story-driven, camera-focused |
| **Classic** | General Purpose | Balanced, flexible |
| **Photography** | Still Images | Photo-realistic, professional |
| **Drone / Landscape** | Aerial Views | Wide shots, landscapes |
| **Animation** | Animated Content | Stylized, motion-focused |

### 📊 CSV Prompt Builder

- **Batch Creation** - Generate multiple prompts at once
- **Auto-save** - Never lose your work
- **Template System** - Reuse successful prompt patterns
- **Grid Editor** - Spreadsheet-like interface
- **Export Options** - JSON, Markdown, Plain Text, CSV

### ⚙️ Customization

- **Preset Management** - Create and save custom presets
- **Option Sets** - Customize dropdown options per mode
- **Keyboard Shortcuts** - Full customization support
- **Accent Colors** - Choose from 10 beautiful color themes (Blue, Purple, Pink, Red, Orange, Yellow, Green, Teal, Cyan, Indigo)
- **Light Theme** - Clean, modern interface optimized for readability
- **Export Templates** - Custom export formats

### 🎯 Quality Tools

- **Randomization** - Generate creative variations
- **Undo/Redo** - Full history support
- **Step Locking** - Protect completed steps
- **Batch Randomization** - Experiment with multiple versions
- **Quality Analyzer** - AI-powered prompt scoring

---

## ⌨️ Keyboard Shortcuts

### Navigation
- `Ctrl + →` - Next step
- `Ctrl + ←` - Previous step
- `Ctrl + 1-9` - Jump to specific step
- `Ctrl + R` - Reset current step

### Actions
- `Ctrl + S` - Save project
- `Ctrl + O` - Open project
- `Ctrl + E` - Export prompt
- `Ctrl + D` - Duplicate current
- `Ctrl + Z` - Undo
- `Ctrl + Y` - Redo

### Tools
- `Ctrl + ,` - Open settings
- `Ctrl + /` - Show keyboard shortcuts
- `Ctrl + P` - Open projects
- `Ctrl + H` - View history
- `Ctrl + B` - Batch randomize

### AI (when enabled)
- `Ctrl + Space` - Open AI chat
- `Ctrl + Enter` - Send message
- `Ctrl + A` - Analyze quality
- `Ctrl + I` - Get suggestions

---

## 💻 Development

### Prerequisites

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 8.x or higher (included with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Windows OS** (for building Windows installer)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/jamesk9526/LTX-Prompt-Creator.git
cd LTX-Prompt-Creator/electron-app

# Install dependencies
npm install

# Run in development mode
npm run dev:electron
```

### Available Scripts

```bash
# Development
npm run dev              # Start Next.js dev server
npm run dev:electron     # Run full Electron app with hot reload

# Building
npm run build            # Build Next.js app
npm run dist:win         # Create Windows installer
npm run dist:mac         # Create macOS installer (macOS only)
npm run dist:linux       # Create Linux packages

# Testing & Quality
npm run test             # Run all tests
npm run lint             # Run ESLint
npm run icons            # Generate app icons

# Utilities
npm run clean            # Clean build artifacts
```

### Project Structure

```
electron-app/
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   ├── wizard/             # Wizard page & components
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types
│   └── globals.css         # Global styles
├── electron/               # Electron main process
│   ├── main.js             # Main entry point
│   ├── preload.js          # Preload script
│   └── server.js           # Dev server
├── assets/                 # App assets (icons, etc.)
├── scripts/                # Build scripts
└── tests/                  # Test files
```

### Building for Production

#### Windows

```bash
cd electron-app
npm run dist:win
```

Output files will be in `electron-app/release/`:
- `LTX Prompter Setup 1.2.0.exe` - NSIS installer
- `LTX Prompter 1.2.0 x64 Portable.exe` - Standalone executable

#### macOS (on macOS)

```bash
cd electron-app
npm run dist:mac
```

#### Linux

```bash
cd electron-app
npm run dist:linux
```

### Development Tips

1. **Hot Reload** - Changes to React components reload automatically
2. **DevTools** - Press `F12` in the app to open Chrome DevTools
3. **Console Logs** - Check terminal for backend logs, DevTools for frontend
4. **Ollama** - Install [Ollama](https://ollama.ai/) to test AI features
5. **Testing** - Run tests before committing changes

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:quality        # Quality analyzer tests
npm run test:natural        # Prompt validation tests
```

### Test Coverage

- Prompt validation
- Quality analysis
- Randomization stress tests
- Feature integration tests
- Electron server routing

---

## 📚 Documentation

### Additional Resources

- **[INFO.md](INFO.md)** - Detailed technical documentation
- **[TODO.md](TODO.md)** - Roadmap and planned features
- **[Issues](https://github.com/jamesk9526/LTX-Prompt-Creator/issues)** - Bug reports and feature requests
- **[Releases](https://github.com/jamesk9526/LTX-Prompt-Creator/releases)** - Version history and downloads

### API Documentation

For developers integrating with LTX Prompter:

- **Electron IPC API** - See `electron/preload.js`
- **Prompt Format** - See `app/types/`
- **Export Formats** - See `app/utils/exporters.ts`

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

1. **Report Bugs** - Open an [issue](https://github.com/jamesk9526/LTX-Prompt-Creator/issues)
2. **Suggest Features** - Share your ideas in [discussions](https://github.com/jamesk9526/LTX-Prompt-Creator/discussions)
3. **Submit PRs** - Fix bugs or add features
4. **Improve Docs** - Help us document better
5. **Share Feedback** - Let us know what you think!

### Development Workflow

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/amazing-feature

# 3. Make your changes
# 4. Test thoroughly
npm run test
npm run lint

# 5. Commit with a clear message
git commit -m "Add amazing feature"

# 6. Push to your fork
git push origin feature/amazing-feature

# 7. Open a Pull Request
```

### Code Style

- Follow existing code patterns
- Use TypeScript where possible
- Add comments for complex logic
- Write tests for new features
- Keep commits atomic and well-described

---

## 🐛 Troubleshooting

### Common Issues

#### App won't start
**Solution:** Try running `npm install` again, check Node.js version (need 18+)

#### Ollama not connecting
**Solutions:**
1. Ensure Ollama is installed and running
2. Check that Ollama is listening on `http://localhost:11434`
3. Verify your firewall isn't blocking the connection
4. Try restarting Ollama: `ollama serve`

#### Build fails
**Solution:** 
1. Clear caches: `npm run clean`
2. Delete `node_modules`: `rm -rf node_modules`
3. Reinstall: `npm install`
4. Try building again: `npm run build`

#### Slow performance
**Solutions:**
1. Close other Electron apps
2. Reduce chat history if it's very long
3. Disable AI features if not needed
4. Check for background processes

### Getting Help

- **Discord** - Join our community (coming soon)
- **Issues** - [Open an issue](https://github.com/jamesk9526/LTX-Prompt-Creator/issues)
- **Email** - Contact maintainers

---

## 🔒 Privacy & Security

- **Local Storage** - All data stored on your computer
- **No Telemetry** - We don't collect usage data
- **Optional AI** - Ollama integration is completely optional
- **Open Source** - Review the code yourself

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ⚠️ No warranty
- ⚠️ No liability

---

## 🙏 Acknowledgments

### Built With

- **[Next.js](https://nextjs.org/)** - React framework
- **[Electron](https://www.electronjs.org/)** - Desktop app framework
- **[React](https://react.dev/)** - UI library
- **[Ollama](https://ollama.ai/)** - Local AI models
- **[Lucide React](https://lucide.dev/)** - Icon library

### Special Thanks

- All contributors and testers
- The Next.js and Electron communities
- Everyone who provided feedback

---

## 🚀 Roadmap

### Coming Soon
- 🌐 macOS and Linux support
- 🔍 Advanced search and filtering
- 🌓 Dark mode theme option
- 🌍 Multi-language support
- ☁️ Cloud sync (optional)
- 🤝 Collaboration features

### ✅ Recently Added
- ✨ Light theme with clean, flat design
- 🎨 Customizable accent colors (10 presets)
- 🎯 Improved UI organization and readability

See [TODO.md](TODO.md) for detailed roadmap.

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/jamesk9526/LTX-Prompt-Creator?style=social)
![GitHub forks](https://img.shields.io/github/forks/jamesk9526/LTX-Prompt-Creator?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/jamesk9526/LTX-Prompt-Creator?style=social)

---

<div align="center">

**Made with ❤️ for creative professionals**

[⬆ Back to Top](#ltx-prompter)

</div>
