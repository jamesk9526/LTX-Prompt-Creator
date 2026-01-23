// Core constants and type definitions - extracted for better code organization
// These are the foundational types used throughout the wizard

export type ModeId = 'cinematic' | 'classic' | 'drone' | 'animation' | 'photography' | 'nsfw';
export type CaptureWord = 'shot' | 'video' | 'clip' | 'frame' | 'photo';
export type PromptFormat = 'ltx2' | 'paragraph';
export type DetailLevel = 'minimal' | 'balanced' | 'rich';

export interface UiPrefs {
  typingEnabled: boolean;
  typingSpeedMs: number;
  captureWord: CaptureWord;
  autoCopyOnReview: boolean;
  promptFormat: PromptFormat;
  detailLevel: DetailLevel;
  autoFillAudio: boolean;
  autoFillCamera: boolean;
  previewFontScale: number;
  hideNsfw: boolean;
  allowNsfwInChat: boolean;
}

export interface OllamaSettings {
  enabled: boolean;
  apiEndpoint: string;
  model: string;
  systemInstructions: string;
  temperature: number;
}

export interface Project {
  id: string;
  name: string;
  mode: ModeId;
  nsfwEnabled: boolean;
  values: Record<string, Record<string, string>>;
  createdAt: number;
  updatedAt: number;
}

export const MODES = [
  { id: 'cinematic' as ModeId, title: 'Cinematic', tag: 'Camera-forward', desc: 'Film-inspired framing, motion, and grading.' },
  { id: 'classic' as ModeId, title: 'Classic', tag: 'Balanced', desc: 'Cohesive, versatile looks for general prompts.' },
  { id: 'drone' as ModeId, title: 'Drone / Landscape', tag: 'Non-person', desc: 'Aerials, landscapes, architecture, and environment-first footage.' },
  { id: 'animation' as ModeId, title: 'Animation', tag: 'Stylized', desc: '2D/3D/stop-motion/anime-friendly wording and presets.' },
  { id: 'photography' as ModeId, title: 'Photography', tag: 'Still Image', desc: 'Professional photography for Stable Diffusion and Flux Dev.' },
  { id: 'nsfw' as ModeId, title: 'NSFW', tag: '18+', desc: 'Adult-focused styling. Requires NSFW enabled.' },
];

export const DEFAULT_UI_PREFS: UiPrefs = {
  typingEnabled: false,
  typingSpeedMs: 2,
  captureWord: 'photo',
  autoCopyOnReview: false,
  promptFormat: 'paragraph',
  detailLevel: 'rich',
  autoFillAudio: true,
  autoFillCamera: true,
  previewFontScale: 1,
  hideNsfw: true,
  allowNsfwInChat: false,
};

// Storage keys
export const STORAGE_KEYS = {
  OPTION_SETS: 'ltx_prompter_option_sets_v1',
  UI_PREFS: 'ltx_prompter_ui_prefs_v1',
  PROJECTS: 'ltx_prompter_projects_v1',
  FAVORITES: 'ltx_prompter_favorites_v1',
  HISTORY: 'ltx_prompter_history_v1',
  LOCKED_STEPS: 'ltx_prompter_locked_steps_v1',
  OLLAMA_SETTINGS: 'ltx_prompter_ollama_settings_v1',
  CHAT_SETTINGS: 'ltx_prompter_chat_settings_v1',
} as const;
