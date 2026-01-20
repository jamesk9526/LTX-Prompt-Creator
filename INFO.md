# LTX Prompter - Technical Information

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Development Guide](#development-guide)
- [Testing](#testing)
- [Building & Distribution](#building--distribution)
- [Code Style & Patterns](#code-style--patterns)

---

## Architecture Overview

### Application Stack
- **Frontend**: Next.js 14 + React 18
- **Desktop**: Electron 29
- **Language**: TypeScript (strict mode)
- **Styling**: CSS Modules + Global CSS with Design System
- **State**: React Hooks + Local Storage
- **IPC**: Electron IPC for main/renderer communication

### Key Components

```
electron-app/
├── app/                      # Next.js application
│   ├── wizard/              # Main prompt wizard
│   │   ├── page.tsx         # Core wizard logic (multi-step form)
│   │   ├── components/      # TopBar, PreviewSidebar, ToolsMenu
│   │   └── modals/          # Settings, Ollama AI panel
│   ├── components/          # Shared React components
│   │   ├── ChatPanel.tsx    # AI chat integration
│   │   ├── VirtualizedChatPanel.tsx  # Performance-optimized chat
│   │   ├── ChatHistorySidebar.tsx    # Session management
│   │   ├── ErrorBoundary.tsx         # Error handling
│   │   └── modals/          # Reusable modal components
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript definitions
│   └── utils/               # Utility functions
│       ├── ChatHistoryManager.ts     # Chat session storage
│       ├── ActionExecutor.ts         # AI action execution
│       ├── ollamaEnhancements.ts     # Quality analysis, suggestions
│       ├── logger.ts                 # Logging utilities
│       └── debounce.ts               # Performance utilities
├── electron/                # Electron main process
│   ├── main.js              # App entry point
│   └── preload.js           # IPC bridge (secure context)
├── public/                  # Static assets
├── tests/                   # Test suites
│   ├── quality-analyzer.test.js      # Quality analyzer tests (18 units)
│   └── prompt-validation.test.js     # Prompt validation
├── system_prompts/          # AI system prompts
└── package.json
```

### Data Flow

```
User Interface (React Components)
    ↕ (IPC via preload.js - secure bridge)
Electron Main Process
    ↕
File System / OS APIs / Ollama HTTP API
```

### Storage Architecture

- **Local Storage**: User settings, projects, prompts, favorites
- **Chat History**: localStorage with 10MB limit, 100 sessions max
- **Project Data**: JSON files via Electron IPC (file system)
- **System Prompts**: Text files loaded from file system

---

## Project Structure

### CSS Architecture

The app uses a **design system** approach with CSS custom properties:

```css
/* Global Theme Variables (globals.css) */
--bg: #0a0a0f                          /* Deep background */
--panel: rgba(13, 13, 22, 0.95)        /* Panel backgrounds */
--text: #e8e6f0                        /* Primary text */
--accent: #8b5cf6                      /* Purple accent */
--border: rgba(139, 92, 246, 0.3)      /* Border color */
--radius: 8px                          /* Border radius */
```

**CSS Files:**
- `globals.css` - Global theme variables and base styles
- `wizard.css` - Main wizard layout and step styling
- Component-specific CSS modules for isolated styling

### TypeScript Structure

**Types Directory:**
- `actions.ts` - AI action types (update_field, navigate_step, etc.)
- Component prop types inline with components

**Strict Mode Enabled:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

---

## Development Guide

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

# Run in development mode (hot reload enabled)
npm run dev:electron
```

### Available Scripts

```bash
# Development
npm run dev              # Next.js dev server only (port 3000)
npm run dev:electron     # Full Electron app with hot reload

# Building
npm run build           # Build Next.js app to /out directory
npm run dist:win        # Create Windows installer + portable exe

# Testing
npm run test            # Run all tests (quality + validation)
npm run test:quality    # Run quality analyzer tests (18 units)
npm run test:natural    # Run prompt validation tests

# Utilities
npm run clean           # Clean build artifacts (.next, out)
npm run type-check      # Run TypeScript type checking
npm run lint            # Run ESLint
```

### Environment Setup

The app auto-detects Electron environment via `process.env.ELECTRON`:
- In Electron: Uses IPC for file operations
- In Browser (dev): Uses localStorage and mock APIs

No environment variables required for basic development.

### Debugging

- **React DevTools**: Available in development mode
- **Chrome DevTools**: Press F12 in the app window
- **Main Process Logs**: Check terminal running `npm run dev:electron`
- **Renderer Logs**: Check DevTools console in app window

---

## Testing

### Test Suite Overview

**Quality Analyzer Tests** (`tests/quality-analyzer.test.js`):
- 18 comprehensive unit tests
- Tests Ollama JSON parsing, quality analysis, field suggestions
- Tests multiple response formats (JSON in text, malformed JSON, escaped JSON)
- 100% code coverage of parsing logic
- Execution time: ~50ms

**Prompt Validation Tests** (`tests/prompt-validation.test.js`):
- Natural language prompt validation
- Ensures prompts are continuous paragraphs (no bullets/sections)
- Tests prompt structure and formatting rules

### Running Tests

```bash
# Run all tests
npm run test

# Run only quality analyzer tests
npm run test:quality

# Expected output:
# 🔍 QUALITY ANALYZER TEST SUITE
# ✅ Valid JSON parsing works
# ✅ JSON in text parsing works
# ... (18 tests total)
# 🎉 ALL TESTS PASSED!
```

### Test Coverage

- **Unit Tests**: 18 tests covering ollamaEnhancements.ts
- **Integration Tests**: Manual testing via `npm run dev:electron`
- **Coverage**: 100% of quality analyzer parsing logic

### Quality Analyzer Feature

The quality analyzer feature (Step 10: 🔍 Analyze Quality):
- Analyzes prompt quality using Ollama LLM
- Returns quality score (0-100) and improvement suggestions
- Uses multi-layer JSON extraction for robust parsing:
  1. Direct JSON.parse() (fast path)
  2. Regex extraction for JSON in text
  3. Graceful fallback to defaults
  4. Type-safe parsing (parseInt, Array.isArray)

---

## Building & Distribution

### Windows Installer

```bash
cd electron-app
npm run dist:win
```

**Output** (in `electron-app/release/`):
1. `LTX Prompter Setup 1.2.0.exe` - NSIS installer with start menu integration
2. `LTX Prompter 1.2.0 x64 Portable.exe` - Standalone executable (no installation)

### Build Configuration

See `package.json` build section:
```json
{
  "build": {
    "appId": "com.ltxprompter.app",
    "productName": "LTX Prompter",
    "directories": {
      "buildResources": "assets",
      "output": "release"
    },
    "files": ["./out", "./electron", "./assets", "./package.json"],
    "win": {
      "icon": "assets/icon.ico",
      "target": ["nsis", "portable"]
    }
  }
}
```

### Release Checklist

1. Update version in `package.json`
2. Run `npm run test` to verify all tests pass
3. Run `npm run build` to test Next.js build
4. Run `npm run dist:win` to create installer
5. Test installer and portable exe on clean system
6. Create GitHub release with version tag
7. Upload build artifacts to release

---

## Code Style & Patterns

### React Patterns

**Component Structure:**
```tsx
'use client';  // Next.js client component

import { useState, useEffect } from 'react';
import './component.css';

export default function Component() {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Side effects
  }, []);
  
  return <div className="component">...</div>;
}
```

**Hooks Usage:**
- `useState` for local component state
- `useEffect` for side effects (API calls, storage)
- `useCallback` for memoized callbacks (performance)
- `useMemo` for expensive computations
- `useRef` for DOM references and mutable values

### TypeScript Conventions

- **Strict mode enabled** - all code must pass type checking
- **Explicit types** for function parameters and return values
- **Type imports** separated from value imports
- **Interfaces** for object shapes, **types** for unions/intersections

### CSS Conventions

- **CSS Modules** for component-scoped styles (`.module.css`)
- **Global CSS** for theme variables and shared utilities
- **Design tokens** via CSS custom properties (`--variable-name`)
- **BEM naming** for complex components (`.block__element--modifier`)

### Code Organization

- **One component per file** (except small related components)
- **Co-locate related files** (component + styles + tests)
- **Barrel exports** avoided (direct imports preferred)
- **Utils in separate files** (logger, debounce, etc.)

### Performance Patterns

**Chat Virtualization:**
- Uses `VirtualizedChatPanel` for 1000+ messages
- Only renders visible messages (windowing)
- Maintains scroll position during updates

**Debouncing:**
- Auto-save uses debounced functions (300ms delay)
- Search/filter inputs debounced (150ms delay)

**Error Boundaries:**
- Catch React component errors gracefully
- Show fallback UI instead of crashing
- Log errors for debugging

---

## Key Features Implementation

### AI Actions System

Ollama can control the UI via structured actions:
```typescript
{
  "action": "update_field",
  "field": "subject",
  "value": "A futuristic cityscape"
}
```

**Available Actions:**
- `update_field` - Modify form field values
- `navigate_step` - Change wizard step
- `set_mode` - Switch between modes (Cinematic, Classic, etc.)
- `apply_preset` - Load prompt presets

### Chat History Management

**Features:**
- Save/load chat sessions (up to 100)
- Search and filter conversations
- Export to JSON, Markdown, or Plain Text
- 10MB localStorage limit with automatic cleanup

**Storage Keys:**
```typescript
const CHAT_HISTORY_KEY = 'ltx_prompter_chat_history_v1';
const PROJECTS_KEY = 'ltx_prompter_projects_v1';
const SETTINGS_KEY = 'ltx_prompter_ollama_settings_v1';
```

### Ollama Integration

**Endpoints:**
- `POST /api/chat` - Stream chat responses
- `GET /api/tags` - List available models
- `POST /api/generate` - Generate completions

**Error Handling:**
- Connection timeout (5 seconds)
- Retry logic with exponential backoff
- Graceful fallback when Ollama unavailable

---

## Additional Resources

- **GitHub Repository**: https://github.com/jamesk9526/LTX-Prompt-Creator
- **Issues**: https://github.com/jamesk9526/LTX-Prompt-Creator/issues
- **Main README**: See README.md for user documentation
- **License**: MIT License

---

**Last Updated**: January 2026 | **Version**: 1.2.0
