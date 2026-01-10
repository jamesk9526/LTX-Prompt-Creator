# Building LTX Prompter Desktop App

This guide walks through building the LTX Prompter Electron application with installers for Windows, macOS, and Linux.

## Prerequisites

- Node.js 16+ and npm
- Windows: NSIS (for `.exe` installer) — automatically downloaded by electron-builder
- macOS: Xcode Command Line Tools
- Linux: Build essentials (gcc, make, etc.)

## Installation

```bash
cd electron-app
npm install
```

## Development

Run the app in development mode with hot-reload:

```bash
npm run dev:electron
```

This starts the Next.js dev server on `http://localhost:3000` and the Electron window concurrently.

## Building for Production

### Build all platforms

```bash
npm run dist
```

This will:
1. Build the Next.js app as static export to `./out/`
2. Run electron-builder to create installers in `./dist/`

### Build for specific platform

- **Windows (NSIS + Portable):**
  ```bash
  npm run dist:win
  ```

- **macOS (DMG + ZIP):**
  ```bash
  npm run dist:mac
  ```

- **Linux (AppImage + DEB):**
  ```bash
  npm run dist:linux
  ```

## Output

Installers and portable executables will be in the `./dist/` folder:

### Windows
- `LTX Prompter 1.0.0.exe` — NSIS installer (recommended)
- `LTX Prompter 1.0.0 x64 Portable.exe` — Standalone executable

### macOS
- `LTX Prompter-1.0.0.dmg` — Disk image for easy install
- `LTX Prompter-1.0.0-mac.zip` — Compressed app bundle

### Linux
- `ltx-prompter-1.0.0.AppImage` — Standalone image (no installation needed)
- `ltx-prompter_1.0.0_amd64.deb` — Debian package

## Configuration

### App Metadata

Edit `package.json` to customize:

```json
{
  "name": "ltx-prompter",
  "version": "1.0.0",
  "description": "...",
  "build": {
    "appId": "com.ltxprompter.app",
    "productName": "LTX Prompter",
    ...
  }
}
```

### Icons & Assets

Place app icons in `./assets/`:
- `icon.png` (256×256 or larger for Windows/Linux)
- `icon.icns` (for macOS)
- `icon.ico` (for Windows taskbar)

electron-builder can auto-generate icons from a single PNG if not provided.

## File Structure

```
electron-app/
├── app/                  # Next.js pages & components
├── electron/
│   ├── main.js          # Electron main process
│   └── preload.js       # IPC bridge (secure context isolation)
├── assets/              # App icons & resources
├── out/                 # Built Next.js export (created at build time)
├── dist/                # Final installers (created at build time)
├── next.config.mjs      # Next.js config (export mode)
└── package.json         # Scripts and electron-builder config
```

## Troubleshooting

### "Not enough storage" or build fails

- Clear caches: `rm -rf node_modules out dist && npm install`
- electron-builder downloads runtimes on first build (can take time)

### Windows NSIS installer issues

- Ensure NSIS is in PATH or electron-builder will download it
- Check `package.json` `build.nsis` settings for customization

### macOS code signing

By default, electron-builder skips signing. For distribution:

```bash
CSC_IDENTITY_AUTO_DISCOVERY=false npm run dist:mac
```

Or set `CSC_LINK` and `CSC_KEY_PASSWORD` environment variables.

### Linux AppImage permissions

After creating the AppImage, make it executable:

```bash
chmod +x dist/ltx-prompter-*.AppImage
./dist/ltx-prompter-*.AppImage
```

## Versioning

Update version in `package.json` before each build:

```json
{
  "version": "1.0.1"
}
```

Both the app and installers will use this version.

## Next Steps

- Customize app icons in `./assets/`
- Update `main.js` to handle app-specific IPC channels
- Configure code signing for production releases
- Set up auto-update (requires hosting update server)
