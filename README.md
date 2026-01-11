# LTX Prompter - Executable Build Instructions
<img width="1280" height="900" alt="Screenshot 2026-01-11 015819" src="https://github.com/user-attachments/assets/1e64b4d6-479a-4936-8033-63d5d96aafc1" />


## Overview
This repository contains the LTX Prompter application, previously a Tkinter desktop wizard for generating prompts for AI video/image generation. A new web-based version now ships in the `web/` folder with two modes:
- **Cinematic Scene**: one-paragraph cinematic beats (Style → Shot → Subject → Costume/Prop → Setting → Light → Sound/Dialog → Camera move end beat) with seedable randomization and guardrails.
- **Structured Prompt**: a lightweight wizard-style paragraph builder for general prompts.

## Building the Executable

### Prerequisites
- Python 3.7+ installed
- PyInstaller installed: `pip install pyinstaller`

### Build Steps
1. Run the build script:
   ```bash
   python build_exe.py
   ```

2. The executable will be created in the `dist/` folder as `LTX_Prompter.exe`

### Manual Build (Alternative)
If the build script doesn't work, you can run PyInstaller directly:
```bash
pyinstaller --onefile --windowed --name LTX_Prompter LTXPROMPTER.py
```


<img width="1338" height="963" alt="Screenshot 2026-01-11 015737" src="https://github.com/user-attachments/assets/777164fb-e197-45ec-af49-349e57c7340b" />



## Running the Application
- **Web app (recommended):**
   - Open `web/index.html` directly in a browser, or run a static server (e.g. VS Code Live Server) pointing at the `web/` folder.
   - Use the mode tabs to switch between Cinematic Scene and Structured Prompt.
   - Optional seed box + Randomize to get deterministic picks; Copy buttons copy the one-paragraph output.
- **Legacy desktop app:** Double-click `LTX_Prompter.exe` to run the packaged Tkinter UI.

## Features
- Web UI with dark theme, mode tabs, seedable randomize, and copy.
- Cinematic mode follows the requested template (dialogue formatting, camera sentence ends the beat, signature visuals, guardrails for weather/lighting and pullback reveals).
- Structured mode offers a concise paragraph builder with common cinematic fields.
- Legacy Tkinter wizard remains available; packaged `.exe` still supported.

## Notes
- The executable is built with `--windowed` to hide the console
- Built as a single file (`--onefile`) for easy distribution
- Compatible with Windows systems
