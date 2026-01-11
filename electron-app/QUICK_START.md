# Quick Start: Build & Run LTX Prompter

## One-Command Build (Windows)

To build the Windows installer and portable app:

```bash
npm run dist:win
```

This creates:
- **LTX Prompter 1.0.0.exe** — Full NSIS installer (includes uninstaller, Start Menu)
- **LTX Prompter 1.0.0 x64 Portable.exe** — Standalone, no installation needed

Both are in the `./dist/` folder when done.

## Development Mode

To run the app with live-reload:

```bash
npm run dev:electron
```

- Opens the app window immediately
- Next.js dev server runs on http://localhost:3000
- Changes to React/Next.js code auto-refresh in the window
- Electron DevTools open automatically

## Production Build (No Distribution)

If you just want to build the app without creating an installer:

```bash
npm run build
```

This creates a static export in `./out/` that Electron can load offline.

## File Locations

| What | Where |
|------|-------|
| Built Next.js app | `./out/` |
| Installers & portable exes | `./dist/` |
| App source code | `./app/` |
| Electron main process | `./electron/main.js` |
| App icons & assets | `./assets/` |

## Version Number

Update the version in `package.json` before each release:

```json
{
  "version": "1.0.1"
}
```

Both the app window and installer will reflect this.

## Troubleshooting

**Build fails?**  
Clear caches and reinstall:
```bash
rm -rf node_modules out dist && npm install && npm run dist:win
```

**App won't start?**  
Check that Next.js built successfully:
```bash
npm run build
```

Then verify `./out/index.html` exists.

**Need to change app name, icon, or description?**  
Edit `package.json` under `name`, `description`, and `build.productName`.

---

See [BUILD.md](BUILD.md) for detailed configuration and advanced options.

## Movement Prompts (Step 5)

- Use the new fields to structure motion:
  - **Movement subject type:** Person or Object.
  - **Movement subject label:** Free text like "the person" or "the suitcase".
  - **Movement 1 / Movement 2:** Pick or type actions (e.g., "walks in" then "sits").
- If you leave the "Core actions" box empty, these movement beats will be auto-included in the final prompt.
 - Write "Core actions" as a short synopsis using beats like "Opening", "Mid beat", and "Closing" — avoid seconds or timestamps.
