# LTX Prompter (Electron/Next)

LTX Prompter is a friendly, guided prompt wizard for video and creative production. The current app is built with Next.js + React and packaged for Windows using Electron.

## Quick Start (Dev)

### Prerequisites
- Node.js 18+
- Windows (for Electron packaging)

### Install & Run
```powershell
Push-Location "electron-app"
npm install
npm run dev:electron
Pop-Location
```

- App runs at a local Next.js server; Electron loads that UI automatically.
- Use the top bar to switch `Step`, change `Mode`, and open `Projects` and `Settings`.

## Build Installer (Windows)
```powershell
Push-Location "electron-app"
npm run dist:win
Pop-Location
```
- Output: installer under `electron-app/release/`.
- The installer shows notes about Ollama and a link to install it.

## AI Features via Ollama
Some features (like “Ollama Expand” and AI-assisted generation) require Ollama.

- Install Ollama: https://ollama.com/
- After installing, open the app → `Settings` → enable Ollama and pick a model.
- Default endpoint: `http://localhost:11434`
- Tip: Pull or set models (e.g., `llama3`, `mistral`) before using expansion.

### Troubleshooting
- If the “Ollama Expand” button is disabled, enable Ollama in `Settings`.
- If API calls fail, confirm the Ollama service is running and the endpoint matches.

## Links & Support
- Repo: https://github.com/jamesk9526/LTX-Prompt-Creator
- Issues: https://github.com/jamesk9526/LTX-Prompt-Creator/issues
- Tip jar: https://ko-fi.com/jamesknox

## Legacy (Old Tkinter/Web Notes)
Earlier versions shipped a Tkinter executable and a static web page. Those instructions are now deprecated; use the Electron build above for the best experience.