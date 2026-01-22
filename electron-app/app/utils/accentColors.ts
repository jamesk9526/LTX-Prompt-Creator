/**
 * Accent Color Management Utility
 * Provides functions to manage and apply accent colors throughout the application
 */

export interface AccentColorPreset {
  name: string;
  hue: number;
  saturation: number;
  lightness: number;
}

export const ACCENT_COLOR_PRESETS: AccentColorPreset[] = [
  { name: 'Blue', hue: 210, saturation: 79, lightness: 51 },
  { name: 'Purple', hue: 270, saturation: 70, lightness: 55 },
  { name: 'Pink', hue: 330, saturation: 70, lightness: 60 },
  { name: 'Red', hue: 0, saturation: 70, lightness: 55 },
  { name: 'Orange', hue: 25, saturation: 85, lightness: 55 },
  { name: 'Yellow', hue: 45, saturation: 90, lightness: 55 },
  { name: 'Green', hue: 140, saturation: 60, lightness: 45 },
  { name: 'Teal', hue: 175, saturation: 70, lightness: 45 },
  { name: 'Cyan', hue: 190, saturation: 80, lightness: 50 },
  { name: 'Indigo', hue: 240, saturation: 70, lightness: 55 },
];

const STORAGE_KEY = 'ltx_prompter_accent_color';

/**
 * Apply accent color to the document
 */
export function applyAccentColor(preset: AccentColorPreset): void {
  // Validate input values
  const hue = Math.max(0, Math.min(360, preset.hue));
  const saturation = Math.max(0, Math.min(100, preset.saturation));
  const lightness = Math.max(0, Math.min(100, preset.lightness));

  const root = document.documentElement;
  root.style.setProperty('--accent-hue', hue.toString());
  root.style.setProperty('--accent-saturation', `${saturation}%`);
  root.style.setProperty('--accent-lightness', `${lightness}%`);
}

/**
 * Validate that an object is a valid AccentColorPreset
 */
function isValidAccentColorPreset(obj: any): obj is AccentColorPreset {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    typeof obj.hue === 'number' &&
    typeof obj.saturation === 'number' &&
    typeof obj.lightness === 'number' &&
    obj.hue >= 0 && obj.hue <= 360 &&
    obj.saturation >= 0 && obj.saturation <= 100 &&
    obj.lightness >= 0 && obj.lightness <= 100
  );
}

/**
 * Get the currently saved accent color from localStorage
 */
export function getSavedAccentColor(): AccentColorPreset | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate the parsed object before returning
      if (isValidAccentColorPreset(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load saved accent color:', error);
  }
  return null;
}

/**
 * Save accent color to localStorage
 */
export function saveAccentColor(preset: AccentColorPreset): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preset));
  } catch (error) {
    console.error('Failed to save accent color:', error);
  }
}

/**
 * Load and apply saved accent color, or use default
 */
export function loadAccentColor(): AccentColorPreset {
  const saved = getSavedAccentColor();
  const preset = saved || ACCENT_COLOR_PRESETS[0]; // Default to Blue
  applyAccentColor(preset);
  return preset;
}

/**
 * Get the color value for a preset (for displaying in UI)
 */
export function getPresetColor(preset: AccentColorPreset): string {
  return `hsl(${preset.hue}, ${preset.saturation}%, ${preset.lightness}%)`;
}
